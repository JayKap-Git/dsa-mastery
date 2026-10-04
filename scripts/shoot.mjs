// Dev tool: screenshot a page in headless Chrome over the DevTools protocol and report console errors.
// Uses Node's built-in WebSocket — no Puppeteer needed.
//
//   node scripts/shoot.mjs <url> <out.png> [--w 1440] [--h 900] [--mobile] [--full]
//                          [--scroll "#s9-3"] [--eval "js to run before capture"] [--wait 1500]
//
// Exit code 1 if the page threw or logged console errors.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const [url, out] = args;
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return dflt;
  const v = args[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
};
if (!url || !out) {
  console.error('usage: node scripts/shoot.mjs <url> <out.png> [--w N] [--h N] [--mobile] [--full] [--scroll sel] [--eval js] [--wait ms]');
  process.exit(2);
}
const W = Number(opt('w', opt('mobile') ? 390 : 1440));
const H = Number(opt('h', opt('mobile') ? 844 : 900));
const WAIT = Number(opt('wait', 1500));

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'shoot-'))}`, 'about:blank',
]);

const wsUrl = await new Promise((resolve, reject) => {
  let buf = '';
  chrome.stderr.on('data', (d) => {
    buf += d;
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) resolve(m[1]);
  });
  setTimeout(() => reject(new Error('Chrome did not start')), 15000);
});

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let nextId = 1;
const pending = new Map();
const listeners = [];
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method) listeners.forEach((l) => l(msg));
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
const once = (method) => new Promise((r) => listeners.push((m) => m.method === method && r(m)));

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const s = (m, p) => send(m, p, sessionId);

const errors = [];
listeners.push((m) => {
  if (m.sessionId !== sessionId) return;
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning'))
    errors.push(`console.${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`);
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push(`log: ${m.params.entry.text} ${m.params.entry.url ?? ''}`);
});
await s('Page.enable');
await s('Runtime.enable');
await s('Log.enable');
await s('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: opt('mobile') ? 2 : 1, mobile: !!opt('mobile') });

const loaded = once('Page.loadEventFired');
await s('Page.navigate', { url });
await loaded;
const evalJs = async (expression) => (await s('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.value;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (opt('full')) {
  // Grow the viewport to the whole page so every client:visible island hydrates, then capture it all.
  const height = await evalJs('document.documentElement.scrollHeight');
  await s('Emulation.setDeviceMetricsOverride', { width: W, height: Math.min(height, 16000), deviceScaleFactor: 1, mobile: !!opt('mobile') });
}
await sleep(WAIT);
if (opt('scroll')) {
  await evalJs(`document.querySelector(${JSON.stringify(opt('scroll'))})?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -70);`);
  await sleep(WAIT);
}
if (opt('eval')) {
  const r = await evalJs(`(async () => { ${opt('eval')} })()`);
  if (r !== undefined) console.log('eval →', JSON.stringify(r));
  await sleep(WAIT);
}

const overflow = await evalJs('document.documentElement.scrollWidth - window.innerWidth');
const { data } = await s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!opt('full') });
writeFileSync(out, Buffer.from(data, 'base64'));

console.log(`${out}  ${W}×${H}${opt('mobile') ? ' mobile' : ''}  horizontal overflow: ${overflow}px`);
if (errors.length) console.log('ERRORS:\n  ' + errors.join('\n  '));
ws.close();
chrome.kill();
process.exit(errors.length ? 1 : 0);

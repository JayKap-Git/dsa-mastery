// Header account widget, sign-in result toast, sync status, and signed-in/out visibility toggles.
import { cachedUser, onAccountChange, refreshUser, signIn, signOut, startSync, syncStatus, type SyncStatus } from '../../lib/store/sync';

const STATUS_TEXT: Record<SyncStatus, string> = {
  off: 'Not signed in',
  syncing: 'Syncing…',
  synced: 'All changes synced',
  offline: 'Offline · changes are saved on this device',
  error: 'Can’t reach the server · will retry',
};

export function toast(text: string, kind: 'ok' | 'error' = 'ok') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = text;
  el.dataset.kind = kind;
  el.hidden = false;
  clearTimeout(Number(el.dataset.timer));
  el.dataset.timer = String(setTimeout(() => (el.hidden = true), 5000));
}

function render() {
  const user = cachedUser();
  // CSS shows [data-when-signed-in] / [data-when-signed-out] from this flag (set before paint by BaseLayout too).
  document.documentElement.dataset.auth = user ? 'in' : 'out';
  document.querySelectorAll<HTMLElement>('[data-login]').forEach((el) => (el.textContent = user ? `@${user.login}` : ''));
  document.querySelectorAll<HTMLElement>('[data-user-name]').forEach((el) => (el.textContent = user?.name || user?.login || ''));
  document.querySelectorAll<HTMLImageElement>('img[data-avatar]').forEach((img) => {
    if (user?.avatarUrl) {
      img.src = `${user.avatarUrl}${user.avatarUrl.includes('?') ? '&' : '?'}s=64`;
      img.hidden = false;
    } else img.hidden = true;
  });
  document.querySelectorAll<HTMLElement>('[data-avatar-fallback]').forEach((el) => {
    el.textContent = (user?.login ?? '?').slice(0, 1).toUpperCase();
    el.hidden = !!user?.avatarUrl;
  });
  const s = syncStatus();
  document.querySelectorAll<HTMLElement>('[data-sync-dot]').forEach((el) => (el.dataset.state = s));
  document.querySelectorAll<HTMLElement>('[data-sync-text]').forEach((el) => (el.textContent = STATUS_TEXT[s]));
  document.querySelectorAll<HTMLElement>('[data-account-toggle]').forEach((el) => (el.title = `${user ? `@${user.login} · ` : ''}${STATUS_TEXT[s]}`));
}

export function initAccount() {
  document.querySelectorAll('[data-signin]').forEach((b) => b.addEventListener('click', signIn));
  document.querySelectorAll('[data-signout]').forEach((b) =>
    b.addEventListener('click', async () => {
      if (await signOut()) toast('Signed out. Your progress is safe in your account.');
    }),
  );

  // Avatar menu
  const toggle = document.querySelector<HTMLButtonElement>('[data-account-toggle]');
  const pop = document.querySelector<HTMLElement>('[data-account-pop]');
  const close = () => {
    if (pop) pop.hidden = true;
    toggle?.setAttribute('aria-expanded', 'false');
  };
  toggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = pop!.hidden;
    pop!.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => pop && !pop.contains(e.target as Node) && close());
  document.addEventListener('keydown', (e) => e.key === 'Escape' && close());

  // Coming back from GitHub: ?signin=ok|error
  const url = new URL(location.href);
  const result = url.searchParams.get('signin');
  if (result) {
    url.searchParams.delete('signin');
    history.replaceState(history.state, '', url.toString());
  }

  onAccountChange(render);
  render();

  // Anonymous visitors never touch the API. Only a browser that has signed in before (or is just
  // coming back from GitHub) asks who is signed in.
  if (!cachedUser() && !result) return;
  void refreshUser().then((user) => {
    if (result === 'ok' && user) toast(`Signed in as @${user.login}. Your progress now syncs across devices.`);
    else if (result) toast('Sign-in didn’t complete. Please try again.', 'error');
    if (user) startSync();
  });
}

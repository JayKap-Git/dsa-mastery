import { useMemo, useState } from 'react';
import code from '@java/ch06/Scheduling.java?region=earliestEnd';
import { Player } from '../../engine/Player';
import { ActionButton, Segmented, VizShell } from '../../engine/controls';
import { L } from '../../engine/legends';
import { TimelineView } from '../../views/TimelineView';
import { traceSchedule, type Event, type Strategy } from './greedy';

const PRESETS: { label: { en: string; hi: string }; events: Event[] }[] = [
  { label: { en: 'Book example', hi: 'Book wala example' }, events: [{ name: 'A', start: 1, end: 3 }, { name: 'B', start: 2, end: 5 }, { name: 'C', start: 3, end: 9 }, { name: 'D', start: 6, end: 8 }] },
  { label: { en: 'Breaks “shortest”', hi: '“shortest” ko todta' }, events: [{ name: 'A', start: 1, end: 5 }, { name: 'B', start: 4, end: 7 }, { name: 'C', start: 6, end: 10 }] },
  { label: { en: 'Breaks “earliest start”', hi: '“earliest start” ko todta' }, events: [{ name: 'A', start: 1, end: 10 }, { name: 'B', start: 2, end: 4 }, { name: 'C', start: 5, end: 7 }] },
  { label: { en: 'Random', hi: 'Random' }, events: [] },
];

const randomEvents = (): Event[] =>
  Array.from({ length: 7 }, (_, i) => { const s = Math.floor(Math.random() * 12); return { name: String.fromCharCode(65 + i), start: s, end: s + 1 + Math.floor(Math.random() * 5) }; });

export default function ScheduleViz() {
  const [events, setEvents] = useState(PRESETS[0].events);
  const [strategy, setStrategy] = useState<Strategy>('earliestEnd');
  const frames = useMemo(() => traceSchedule(events, strategy), [events, strategy]);
  const max = Math.max(...events.map((e) => e.end)) + 1;
  return (
    <VizShell
      title={{ en: 'Scheduling: which greedy rule works?', hi: 'Scheduling: kaunsa greedy rule chalta hai?' }}
      controls={<>
        <Segmented label={{ en: 'Pick next', hi: 'Agla chuno' }} value={strategy} onChange={setStrategy}
          options={[{ value: 'shortest', label: 'shortest' }, { value: 'earliestStart', label: 'earliest start' }, { value: 'earliestEnd', label: 'earliest end' }]} />
        {PRESETS.map((p) => <ActionButton key={p.label.en} label={p.label} onClick={() => setEvents(p.events.length ? p.events : randomEvents())} />)}
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${strategy}|${JSON.stringify(events)}`}
        code={strategy === 'earliestEnd' ? code : undefined}
        legend={[L.compare, { role: 'done', label: { en: 'taken', hi: 'liya' } }, { role: 'muted', label: { en: 'skipped (overlaps)', hi: 'skip (overlap)' } }]}
        render={({ state }) => <TimelineView items={state.items} min={0} max={max} />}
      />
    </VizShell>
  );
}

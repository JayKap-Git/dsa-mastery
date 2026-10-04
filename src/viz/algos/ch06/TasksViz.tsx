import { useMemo, useState } from 'react';
import code from '@java/ch06/TasksDeadlines.java?region=score';
import { Player } from '../../engine/Player';
import { ActionButton, VizShell } from '../../engine/controls';
import { L } from '../../engine/legends';
import { TimelineView } from '../../views/TimelineView';
import { taskItems, traceTasks, type Task } from './greedy';

const BOOK: Task[] = [{ name: 'A', duration: 4, deadline: 2 }, { name: 'B', duration: 3, deadline: 5 }, { name: 'C', duration: 2, deadline: 7 }, { name: 'D', duration: 4, deadline: 5 }];

export default function TasksViz() {
  const [tasks, setTasks] = useState(BOOK);
  const frames = useMemo(() => traceTasks(tasks), [tasks]);
  const total = tasks.reduce((s, t) => s + t.duration, 0);
  return (
    <VizShell
      title={{ en: 'Tasks and deadlines: the exchange argument', hi: 'Tasks aur deadlines: exchange argument' }}
      controls={<>
        <ActionButton onClick={() => setTasks(BOOK)} label={{ en: 'Book tasks', hi: 'Book ke tasks' }} />
        <ActionButton onClick={() => setTasks(Array.from({ length: 5 }, (_, i) => ({ name: String.fromCharCode(65 + i), duration: 1 + Math.floor(Math.random() * 5), deadline: Math.floor(Math.random() * 15) })))} label={{ en: 'Random', hi: 'Random' }} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={JSON.stringify(tasks)}
        code={code}
        legend={[L.changed, L.active, { role: 'done', label: { en: 'final order', hi: 'final order' } }]}
        render={({ state }) => (
          <div className="stack">
            <TimelineView items={taskItems(state.order, state.roles, state.points)} min={0} max={total} unit={30} />
            <p className="muted" style={{ margin: 0 }}>Σ (deadline − finish) = <b>{state.total}</b></p>
          </div>
        )}
      />
    </VizShell>
  );
}

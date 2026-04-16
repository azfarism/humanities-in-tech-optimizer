import type { ApplicationRow } from '../types/application';

interface DashboardProps {
  items: ApplicationRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}

export default function Dashboard({ items, selectedId, onSelect, onCreateNew }: DashboardProps) {
  return (
    <aside className="panel">
      <div className="panel-header">
        <h2>Applications</h2>
        <button onClick={onCreateNew}>+ New</button>
      </div>

      {items.length === 0 ? (
        <p className="muted">No applications yet. Create your first draft.</p>
      ) : (
        <ul className="list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                className={`list-item ${selectedId === item.id ? 'active' : ''}`}
                onClick={() => onSelect(item.id)}
              >
                <strong>{item.title || 'Untitled application'}</strong>
                <span>{item.status}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

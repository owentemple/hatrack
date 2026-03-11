import { Hat } from '../lib/api'

interface Props {
  hat: Hat
  onToggle: (id: number, done: boolean) => void
  onDelete: (id: number) => void
}

export default function HatItem({ hat, onToggle, onDelete }: Props) {
  return (
    <li className={`hat-item ${hat.done ? 'done' : ''}`}>
      <input
        type="checkbox"
        checked={hat.done}
        onChange={() => onToggle(hat.id, !hat.done)}
      />
      <span className="hat-name">{hat.name}</span>
      <button className="hat-delete" onClick={() => onDelete(hat.id)} title="Delete">
        &times;
      </button>
    </li>
  )
}

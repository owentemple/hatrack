import { useState, useRef, useEffect } from 'react'
import { Hat } from '../lib/api'

interface Props {
  hat: Hat
  onToggle: (id: number, done: boolean) => void
  onDelete: (id: number) => void
  onRename: (id: number, name: string) => void
}

export default function HatItem({ hat, onToggle, onDelete, onRename }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(hat.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  function save() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== hat.name) {
      onRename(hat.id, trimmed)
    } else {
      setDraft(hat.name)
    }
    setEditing(false)
  }

  return (
    <li className={`hat-item ${hat.done ? 'done' : ''}`}>
      <input
        type="checkbox"
        checked={hat.done}
        onChange={() => onToggle(hat.id, !hat.done)}
      />
      {editing ? (
        <input
          ref={inputRef}
          className="hat-name-edit"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') { setDraft(hat.name); setEditing(false) }
          }}
          onBlur={save}
        />
      ) : (
        <span className="hat-name" onClick={() => setEditing(true)}>{hat.name}</span>
      )}
      <button className="hat-delete" onClick={() => onDelete(hat.id)} title="Delete">
        &times;
      </button>
    </li>
  )
}

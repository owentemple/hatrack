import { useRef, useCallback } from 'react'
import { Hat } from '../lib/api'

interface Props {
  hat: Hat
  onToggle: (id: number, done: boolean) => void
  onDelete: (id: number) => void
  onLongPress?: (hat: Hat) => void
}

export default function HatItem({ hat, onToggle, onDelete, onLongPress }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressedRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleTouchStart = useCallback(() => {
    longPressedRef.current = false
    timerRef.current = setTimeout(() => {
      longPressedRef.current = true
      try { navigator.vibrate?.(50) } catch {}
      onLongPress?.(hat)
    }, 500)
  }, [hat, onLongPress])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    clearTimer()
    if (longPressedRef.current) {
      e.preventDefault()
    }
  }, [clearTimer])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (onLongPress) {
      e.preventDefault()
      onLongPress(hat)
    }
  }, [hat, onLongPress])

  return (
    <li className={`hat-item ${hat.done ? 'done' : ''}`}>
      <input
        type="checkbox"
        checked={hat.done}
        onChange={() => onToggle(hat.id, !hat.done)}
      />
      <span
        className="hat-name"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={clearTimer}
        onContextMenu={handleContextMenu}
        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
      >
        {hat.name}
      </span>
      <button className="hat-delete" onClick={() => onDelete(hat.id)} title="Delete">
        &times;
      </button>
    </li>
  )
}

interface Props {
  minutes: string
  seconds: string
  hatName: string
  onStop: () => void
}

export default function Timer({ minutes, seconds, hatName, onStop }: Props) {
  return (
    <div className="clock" onClick={onStop}>
      <p className="timer-hat">{hatName}</p>
      <p className="timer-display">
        {minutes}:{seconds}
      </p>
      <p className="timer-hint">click to end early</p>
    </div>
  )
}

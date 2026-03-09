export default function ScoreDisplay({ score, streak }: { score: number; streak: number }) {
  return (
    <div style={{ textAlign: 'center', margin: '16px 0' }}>
      <span className="score">{score}</span>
      <p style={{ color: '#999', fontSize: '0.8rem', margin: '2px 0 0' }}>Today's Score</p>
      {score === 0 && (
        <p style={{ color: '#bbb', fontSize: '0.75rem', margin: '4px 0 0' }}>
          Complete a session to earn points — one per minute on the timer.
        </p>
      )}
      {streak >= 2 && (
        <p style={{ color: '#999', fontSize: '0.8rem', margin: '4px 0 0' }}>
          {streak} days in a row
        </p>
      )}
    </div>
  )
}

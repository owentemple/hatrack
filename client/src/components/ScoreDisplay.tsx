export default function ScoreDisplay({ score }: { score: number }) {
  return (
    <div style={{ textAlign: 'center', margin: '16px 0' }}>
      <span className="score">{score}</span>
      <p style={{ color: '#999', fontSize: '0.8rem', margin: '2px 0 0' }}>Today's Score</p>
    </div>
  )
}

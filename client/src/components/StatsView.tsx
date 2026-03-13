import { useState } from 'react'
import type { SessionRecord } from '../lib/dataService'
import { TabView, getChartData, getPeriodLabel, navigatePeriod, canGoForward } from '../lib/statsUtils'

interface Props {
  sessions: SessionRecord[]
}

function getYTicks(max: number): number[] {
  if (max <= 0) return []
  // Pick a nice step so we get 2-4 ticks
  const candidates = [1, 2, 5, 10, 15, 20, 25, 50, 100, 200, 500, 1000, 2000, 5000]
  let step = candidates[candidates.length - 1]
  for (const c of candidates) {
    if (max / c <= 4) { step = c; break }
  }
  const ticks: number[] = []
  for (let v = step; v <= max; v += step) {
    ticks.push(v)
  }
  return ticks
}

const TABS: { key: TabView; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

export default function StatsView({ sessions }: Props) {
  const [tab, setTab] = useState<TabView>('week')
  const [anchor, setAnchor] = useState(() => new Date())

  const { bars, total, average, summaryText, subPeriods } = getChartData(sessions, tab, anchor)
  const periodLabel = getPeriodLabel(tab, anchor)
  const canForward = canGoForward(anchor, tab)
  const maxBar = Math.max(...bars.map(b => b.value), 1)
  // Y-axis: pick nice round tick values
  const yTicks = getYTicks(maxBar)

  function handleTabChange(t: TabView) {
    setTab(t)
    setAnchor(new Date())
  }

  return (
    <div className="stats-view">
      <div className="stats-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`stats-tab${tab === t.key ? ' stats-tab--active' : ''}`}
            onClick={() => handleTabChange(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="stats-nav">
        <button className="stats-nav-arrow" onClick={() => setAnchor(navigatePeriod(anchor, tab, -1))}>
          &lsaquo;
        </button>
        <span className="stats-nav-label">{periodLabel}</span>
        <button
          className="stats-nav-arrow"
          onClick={() => canForward && setAnchor(navigatePeriod(anchor, tab, 1))}
          disabled={!canForward}
        >
          &rsaquo;
        </button>
      </div>

      <div className="stats-summary">
        <div className="stats-big-number">
          {tab === 'day' ? total : average}
        </div>
        <div className="stats-big-label">
          {tab === 'day' ? 'total minutes' : 'minutes per day (avg)'}
        </div>
        <div className="stats-summary-text">{summaryText}</div>
      </div>

      <div className="stats-chart-container">
        <div className="stats-y-axis">
          {yTicks.map((tick, i) => (
            <span key={i} className="stats-y-label" style={{ bottom: `${(tick / maxBar) * 100}%` }}>
              {tick}
            </span>
          ))}
          <span className="stats-y-label" style={{ bottom: '0%' }}>0</span>
        </div>
        <div className="stats-chart">
          {bars.map((bar, i) => (
            <div key={i} className="stats-bar-wrapper">
              <div
                className="stats-bar"
                style={{ height: bar.value > 0 ? `${Math.max((bar.value / maxBar) * 100, 3)}%` : '0%' }}
              />
            </div>
          ))}
          <div className="stats-x-axis" />
        </div>
        <div className="stats-x-labels">
          <div className="stats-y-axis-spacer" />
          {bars.map((bar, i) => (
            <div key={i} className="stats-x-label-cell">
              {bar.label && <span className="stats-bar-label">{bar.label}</span>}
            </div>
          ))}
        </div>
      </div>

      {subPeriods.length > 0 && (
        <div className="stats-subperiods">
          {subPeriods.map((sp, i) => (
            <div key={i} className="stats-subperiod">
              <span className="stats-subperiod-label">{sp.label}</span>
              <span className="stats-subperiod-value">{sp.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

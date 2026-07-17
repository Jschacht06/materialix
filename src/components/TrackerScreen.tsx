import { useMemo, useState } from 'react'
import type { MaterialList } from '../lib/types'
import { prettyName, stackBreakdown } from '../lib/format'
import ItemIcon from './ItemIcon'

type SortMode = 'count' | 'name'

interface Props {
  list: MaterialList
  checked: Set<string>
  onToggle: (item: string) => void
  onReset: () => void
  onBack: () => void
}

export default function TrackerScreen({ list, checked, onToggle, onReset, onBack }: Props) {
  const [query, setQuery] = useState('')
  const [hideDone, setHideDone] = useState(false)
  const [sort, setSort] = useState<SortMode>('count')

  const totalBlocks = useMemo(
    () => list.materials.reduce((sum, m) => sum + m.total, 0),
    [list],
  )
  const doneBlocks = list.materials.reduce(
    (sum, m) => sum + (checked.has(m.item) ? m.total : 0),
    0,
  )
  const doneItems = list.materials.filter((m) => checked.has(m.item)).length
  const pct = totalBlocks === 0 ? 0 : (doneBlocks / totalBlocks) * 100
  const allDone = doneItems === list.materials.length

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    let items = list.materials
    if (q) {
      items = items.filter(
        (m) => prettyName(m.item).toLowerCase().includes(q) || m.item.includes(q),
      )
    }
    if (hideDone) items = items.filter((m) => !checked.has(m.item))
    items = [...items]
    if (sort === 'name') {
      items.sort((a, b) => prettyName(a.item).localeCompare(prettyName(b.item)))
    } else {
      items.sort((a, b) => b.total - a.total || a.item.localeCompare(b.item))
    }
    return items
  }, [list, query, hideDone, sort, checked])

  const handleReset = () => {
    if (window.confirm('Uncheck everything and start over?')) onReset()
  }

  return (
    <div className="tracker">
      <div className="tracker-head">
        <div className="tracker-title">
          <h2 title={list.name}>{list.name}</h2>
          <div className="tracker-actions">
            <button className="btn" onClick={handleReset}>
              Reset progress
            </button>
            <button className="btn" onClick={onBack}>
              New list
            </button>
          </div>
        </div>
        <div className="progress">
          <div className="progress-track" role="progressbar" aria-valuenow={Math.round(pct)}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="progress-label">
            <span>
              {doneItems} / {list.materials.length} materials
            </span>
            <span>
              {doneBlocks.toLocaleString()} / {totalBlocks.toLocaleString()} blocks (
              {Math.round(pct)}%)
            </span>
          </div>
        </div>
      </div>

      {allDone && (
        <div className="done-banner">🎉 All materials collected — time to build!</div>
      )}

      <div className="controls">
        <input
          className="search"
          type="search"
          placeholder="Search materials…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          aria-label="Sort order"
        >
          <option value="count">Most needed first</option>
          <option value="name">Name A–Z</option>
        </select>
        <label className="toggle">
          <input
            type="checkbox"
            checked={hideDone}
            onChange={(e) => setHideDone(e.target.checked)}
          />
          Hide collected
        </label>
      </div>

      <ul className="materials">
        {visible.map((m) => {
          const isDone = checked.has(m.item)
          const breakdown = stackBreakdown(m.total)
          return (
            <li key={m.item}>
              <label className={`row${isDone ? ' done' : ''}`}>
                <input
                  type="checkbox"
                  className="check"
                  checked={isDone}
                  onChange={() => onToggle(m.item)}
                />
                <ItemIcon itemId={m.item} />
                <span className="row-name">
                  <span className="row-title">{prettyName(m.item)}</span>
                  <span className="row-id">{m.item}</span>
                </span>
                <span className="row-count">
                  <span className="row-total">{m.total.toLocaleString()}</span>
                  {breakdown && <span className="row-stacks">{breakdown}</span>}
                </span>
              </label>
            </li>
          )
        })}
        {visible.length === 0 && (
          <li className="empty">
            {query
              ? 'No materials match your search.'
              : 'Everything is collected — uncheck "Hide collected" to see the list.'}
          </li>
        )}
      </ul>
    </div>
  )
}

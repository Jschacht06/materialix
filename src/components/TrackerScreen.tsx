import { useMemo, useState } from 'react'
import type { MaterialList } from '../lib/types'
import { prettyName, stackBreakdown } from '../lib/format'
import ItemIcon from './ItemIcon'

type SortMode = 'count' | 'name'

const MAX_NAME_LENGTH = 80

interface Props {
  list: MaterialList
  checked: Set<string>
  onToggle: (item: string) => void
  onRename: (name: string) => void
  onReset: () => void
  onBack: () => void
}

export default function TrackerScreen({
  list,
  checked,
  onToggle,
  onRename,
  onReset,
  onBack,
}: Props) {
  const [query, setQuery] = useState('')
  const [hideDone, setHideDone] = useState(false)
  const [sort, setSort] = useState<SortMode>('count')
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState(list.name)

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

  const startRenaming = () => {
    setDraftName(list.name)
    setEditingName(true)
  }

  const commitName = () => {
    const trimmed = draftName.trim()
    if (trimmed && trimmed !== list.name) onRename(trimmed)
    setEditingName(false)
  }

  return (
    <div className="tracker">
      <div className="tracker-head">
        <div className="tracker-title">
          {editingName ? (
            <input
              className="name-input"
              value={draftName}
              maxLength={MAX_NAME_LENGTH}
              autoFocus
              aria-label="List name"
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={commitName}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitName()
                if (e.key === 'Escape') setEditingName(false)
              }}
            />
          ) : (
            <button className="name-btn" onClick={startRenaming} title="Click to rename">
              <h2>{list.name}</h2>
              <svg className="pencil" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                />
              </svg>
            </button>
          )}
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

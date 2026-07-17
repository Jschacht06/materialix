import { useRef, useState } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import type { MaterialList } from '../lib/types'
import { parseMaterialList } from '../lib/parse'
import { loadSavedLists, deleteList, loadProgress } from '../lib/storage'

interface Props {
  onLoaded: (list: MaterialList) => void
}

function listProgress(list: MaterialList): number {
  const checked = loadProgress(list.id)
  const totalBlocks = list.materials.reduce((sum, m) => sum + m.total, 0)
  if (totalBlocks === 0) return 0
  const doneBlocks = list.materials.reduce(
    (sum, m) => sum + (checked.has(m.item) ? m.total : 0),
    0,
  )
  return Math.round((doneBlocks / totalBlocks) * 100)
}

export default function UploadScreen({ onLoaded }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [pasteOpen, setPasteOpen] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [recent, setRecent] = useState<MaterialList[]>(loadSavedLists)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadFromText = (text: string, fallbackName?: string) => {
    try {
      onLoaded(parseMaterialList(text, fallbackName))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read that material list.')
    }
  }

  const loadFromFile = (file: File) => {
    // Real material lists are a few KB; refuse absurd files before parsing.
    if (file.size > 20 * 1024 * 1024) {
      setError('That file is over 20 MB — a material list export should only be a few kilobytes.')
      return
    }
    file
      .text()
      .then((text) => loadFromText(text, file.name))
      .catch(() => setError('Could not read that file.'))
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) loadFromFile(file)
  }

  const handleFilePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadFromFile(file)
    e.target.value = ''
  }

  const handleDeleteRecent = (id: string) => {
    deleteList(id)
    setRecent(loadSavedLists())
  }

  return (
    <div className="upload-screen">
      <p className="tagline">
        Upload a material list export and check blocks off as you gather them.
      </p>

      <div
        className={`dropzone${dragging ? ' dragging' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
        }}
      >
        <svg className="dropzone-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 3l7 4v10l-7 4-7-4V7l7-4zm0 2.3L7.5 7.9 12 10.5l4.5-2.6L12 5.3zM7 9.6v5.2l4 2.3v-5.2l-4-2.3zm10 0l-4 2.3v5.2l4-2.3V9.6z"
          />
        </svg>
        <strong>Drop your material list here</strong>
        <span>
          or <span className="link">browse for a file</span> (.json)
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.txt,application/json"
          hidden
          onChange={handleFilePick}
        />
      </div>

      {error && <p className="error">{error}</p>}

      <div className="paste-section">
        {pasteOpen ? (
          <>
            <textarea
              className="paste-box"
              placeholder='Paste the JSON here, e.g. { "Materials": [ ... ] }'
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={8}
              autoFocus
            />
            <div className="paste-actions">
              <button
                className="btn primary"
                disabled={!pasteText.trim()}
                onClick={() => loadFromText(pasteText)}
              >
                Load list
              </button>
              <button className="btn" onClick={() => setPasteOpen(false)}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <button className="link-btn" onClick={() => setPasteOpen(true)}>
            …or paste the JSON instead
          </button>
        )}
      </div>

      {recent.length > 0 && (
        <div className="recent">
          <h2>Recent lists</h2>
          <ul className="recent-list">
            {recent.map((list) => {
              const pct = listProgress(list)
              return (
                <li key={list.id}>
                  <button className="recent-card" onClick={() => onLoaded(list)}>
                    <span className="recent-name">{list.name}</span>
                    <span className="recent-meta">
                      {list.materials.length} materials ·{' '}
                      {new Date(list.savedAt).toLocaleDateString()}
                      {pct > 0 && ` · ${pct}% done`}
                    </span>
                    <span className="recent-bar">
                      <span className="recent-bar-fill" style={{ width: `${pct}%` }} />
                    </span>
                  </button>
                  <button
                    className="icon-btn"
                    title="Remove from recent lists"
                    aria-label={`Remove ${list.name}`}
                    onClick={() => handleDeleteRecent(list.id)}
                  >
                    ✕
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

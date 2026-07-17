import { useState } from 'react'
import type { MaterialList } from './lib/types'
import { saveList, loadProgress, saveProgress } from './lib/storage'
import UploadScreen from './components/UploadScreen'
import TrackerScreen from './components/TrackerScreen'

export default function App() {
  const [list, setList] = useState<MaterialList | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const openList = (next: MaterialList) => {
    saveList(next)
    setChecked(loadProgress(next.id))
    setList(next)
  }

  const toggle = (item: string) => {
    if (!list) return
    const next = new Set(checked)
    if (next.has(item)) {
      next.delete(item)
    } else {
      next.add(item)
    }
    setChecked(next)
    saveProgress(list.id, next)
  }

  const resetProgress = () => {
    if (!list) return
    const next = new Set<string>()
    setChecked(next)
    saveProgress(list.id, next)
  }

  return (
    <div className="app">
      <header className="app-header">
        <button
          className="wordmark"
          onClick={() => setList(null)}
          title="Back to upload"
        >
          <svg className="logo" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#6fbf4f" d="M12 2l9 5v2l-9-5-9 5V7l9-5z" />
            <path fill="#55a63c" d="M3 7l9 5v10l-9-5V7z" />
            <path fill="#7dcf5c" d="M21 7l-9 5v10l9-5V7z" />
          </svg>
          Materialix
        </button>
      </header>
      <main>
        {list ? (
          <TrackerScreen
            list={list}
            checked={checked}
            onToggle={toggle}
            onReset={resetProgress}
            onBack={() => setList(null)}
          />
        ) : (
          <UploadScreen onLoaded={openList} />
        )}
      </main>
      <footer className="app-footer">
        Your list stays in your browser — block icons are loaded from{' '}
        <a href="https://mc.nerothe.com/" target="_blank" rel="noreferrer">
          mc.nerothe.com
        </a>
        .
      </footer>
    </div>
  )
}

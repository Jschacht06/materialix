import type { MaterialList } from './types'

const LISTS_KEY = 'materialix.lists.v1'
const MAX_SAVED_LISTS = 20

const progressKey = (id: string) => `materialix.progress.v1.${id}`

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable — the app still works, progress just won't persist.
  }
}

export function loadSavedLists(): MaterialList[] {
  const lists = readJson<MaterialList[]>(LISTS_KEY)
  return Array.isArray(lists) ? lists : []
}

/** Upsert by id; most recently opened first. */
export function saveList(list: MaterialList): void {
  const lists = loadSavedLists().filter((l) => l.id !== list.id)
  lists.unshift({ ...list, savedAt: Date.now() })
  writeJson(LISTS_KEY, lists.slice(0, MAX_SAVED_LISTS))
}

export function deleteList(id: string): void {
  writeJson(
    LISTS_KEY,
    loadSavedLists().filter((l) => l.id !== id),
  )
  try {
    localStorage.removeItem(progressKey(id))
  } catch {
    // ignore
  }
}

export function loadProgress(id: string): Set<string> {
  const items = readJson<string[]>(progressKey(id))
  return new Set(Array.isArray(items) ? items : [])
}

export function saveProgress(id: string, checked: Set<string>): void {
  writeJson(progressKey(id), [...checked])
}

import type { Material, MaterialList } from './types'

/** Stable content hash so re-uploading the same list restores its progress. */
function hashMaterials(materials: Material[]): string {
  const text = materials.map((m) => `${m.item}=${m.total}`).join('|')
  let hash = 5381
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0
  }
  return (hash >>> 0).toString(36)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Parses a Litematica-style material list export. Only `Item` and `Total`
 * matter; everything else in the file is ignored.
 */
export function parseMaterialList(text: string, fallbackName?: string): MaterialList {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('That is not valid JSON. Make sure you export the material list as JSON.')
  }

  if (!isRecord(data) || !Array.isArray(data.Materials)) {
    throw new Error('No "Materials" list found in the file — is this really a material list export?')
  }

  const byItem = new Map<string, number>()
  for (const entry of data.Materials) {
    if (!isRecord(entry) || typeof entry.Item !== 'string') continue
    const total =
      typeof entry.Total === 'number' && Number.isFinite(entry.Total)
        ? Math.floor(entry.Total)
        : 0
    if (total <= 0) continue
    byItem.set(entry.Item, (byItem.get(entry.Item) ?? 0) + total)
  }

  const materials: Material[] = [...byItem.entries()].map(([item, total]) => ({ item, total }))
  if (materials.length === 0) {
    throw new Error('The material list in this file is empty.')
  }
  materials.sort((a, b) => b.total - a.total || a.item.localeCompare(b.item))

  const jsonName = typeof data.Name === 'string' ? data.Name.trim() : ''
  const name =
    (jsonName && jsonName !== 'Unnamed' ? jsonName : '') ||
    fallbackName?.replace(/\.[^.]+$/, '') ||
    'Material list'

  return { id: hashMaterials(materials), name, savedAt: Date.now(), materials }
}

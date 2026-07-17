import { useState } from 'react'
import { itemColor } from '../lib/format'

// Community CDN with in-game-style 64x64 inventory renders (including 3D
// blocks like stairs, chests, and beds). Newest version first; older versions
// cover items that may have been renamed. Unknown items 404 and we fall back
// to a color swatch.
const ICON_VERSIONS = ['1.21.11', '1.21.4']

function iconUrl(itemId: string, version: string): string {
  // Encode so hostile item ids in an uploaded file can't alter the URL
  // structure — anything unknown just 404s into the swatch fallback.
  return `https://mc.nerothe.com/img/${version}/${encodeURIComponent(itemId.replace(':', '_'))}.png`
}

interface Props {
  itemId: string
}

export default function ItemIcon({ itemId }: Props) {
  const [attempt, setAttempt] = useState(0)

  if (attempt >= ICON_VERSIONS.length) {
    return <span className="swatch" style={{ background: itemColor(itemId) }} />
  }

  return (
    <img
      className="item-icon"
      src={iconUrl(itemId, ICON_VERSIONS[attempt])}
      alt=""
      loading="lazy"
      draggable={false}
      onError={() => setAttempt(attempt + 1)}
    />
  )
}

const STACK = 64
const SHULKER = 27 * STACK // 1728

/** "minecraft:dark_oak_stairs" -> "Dark Oak Stairs" */
export function prettyName(itemId: string): string {
  const base = itemId.includes(':') ? itemId.slice(itemId.indexOf(':') + 1) : itemId
  return base
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** "644" -> "10 stacks + 4"; null for amounts under one stack. */
export function stackBreakdown(total: number): string | null {
  if (total < STACK) return null
  const parts: string[] = []
  let rest = total
  const shulkers = Math.floor(rest / SHULKER)
  if (shulkers > 0) {
    parts.push(`${shulkers} shulker${shulkers > 1 ? 's' : ''}`)
    rest %= SHULKER
  }
  const stacks = Math.floor(rest / STACK)
  if (stacks > 0) {
    parts.push(`${stacks} stack${stacks > 1 ? 's' : ''}`)
    rest %= STACK
  }
  if (rest > 0) parts.push(`${rest}`)
  return parts.join(' + ')
}

// Minecraft dye colors — items like "red_carpet" or "light_blue_wool" start
// with one of these.
const DYE_COLORS: Record<string, string> = {
  white: '#e9ecec',
  orange: '#f07613',
  magenta: '#bd44b3',
  light_blue: '#3aafd9',
  yellow: '#f8c527',
  lime: '#70b919',
  pink: '#ed8dac',
  gray: '#3e4447',
  light_gray: '#8e8e86',
  cyan: '#158991',
  purple: '#792aac',
  blue: '#35399d',
  brown: '#724728',
  green: '#546d1b',
  red: '#a12722',
  black: '#141519',
}

// Rough block-palette hints so swatches feel familiar. First match wins.
const MATERIAL_HINTS: Array<[RegExp, string]> = [
  [/deepslate/, '#4c4c56'],
  [/blackstone|basalt|coal/, '#2b2b31'],
  [/dark_oak/, '#3f2d17'],
  [/spruce/, '#68472a'],
  [/crimson/, '#7e3a56'],
  [/warped/, '#2b6963'],
  [/birch/, '#c9b77c'],
  [/jungle/, '#9a6e4d'],
  [/acacia/, '#ad5d32'],
  [/cherry/, '#e2b0aa'],
  [/mangrove/, '#773934'],
  [/bamboo/, '#c4b45c'],
  [/oak|barrel|crafting_table|cartography|smithing|fletching|loom|composter|lectern|bookshelf|chest/, '#a8834f'],
  [/glass/, '#a6cfd4'],
  [/lantern|torch|glowstone|shroomlight|campfire/, '#e9a13c'],
  [/leaves|grass|moss|vine|lily|azalea|fern/, '#4c8a2f'],
  [/furnace|smoker|stone_bricks|stonecutter|andesite|gravel|tuff/, '#7a7a7a'],
  [/granite/, '#956656'],
  [/diorite|quartz|calcite/, '#cfcfca'],
  [/sandstone|sand/, '#dbcf9e'],
  [/prismarine/, '#63a795'],
  [/copper/, '#c06c50'],
  [/iron|anvil|chain/, '#d8d8d8'],
  [/gold/, '#f5cd30'],
  [/diamond/, '#62e5dc'],
  [/emerald/, '#39b84e'],
  [/lapis/, '#2d55c4'],
  [/redstone|observer|piston|hopper|dropper|dispenser/, '#8f2b21'],
  [/amethyst/, '#8a63c5'],
  [/netherrack|nether_brick|magma/, '#6e3533'],
  [/end_stone|purpur/, '#dbde9f'],
  [/obsidian/, '#211836'],
  [/dirt|mud|podzol|soul/, '#79553a'],
  [/water|ice|snow/, '#bcd8e5'],
  [/bed|carpet|wool|banner/, '#c9c3bd'],
  [/stone|cobble/, '#8f8f8f'],
]

/** Deterministic swatch color for an item id, so the list feels scannable. */
export function itemColor(itemId: string): string {
  const base = itemId.includes(':') ? itemId.slice(itemId.indexOf(':') + 1) : itemId
  for (const color of Object.keys(DYE_COLORS)) {
    if (base.startsWith(`${color}_`)) return DYE_COLORS[color]
  }
  for (const [pattern, color] of MATERIAL_HINTS) {
    if (pattern.test(base)) return color
  }
  let hash = 0
  for (let i = 0; i < base.length; i++) hash = (hash * 31 + base.charCodeAt(i)) | 0
  return `hsl(${((hash % 360) + 360) % 360} 45% 55%)`
}

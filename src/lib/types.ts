export interface Material {
  /** Raw item id, e.g. "minecraft:spruce_planks" */
  item: string
  /** How many blocks are needed in total */
  total: number
}

export interface MaterialList {
  /** Content hash — identical lists share progress */
  id: string
  name: string
  savedAt: number
  materials: Material[]
}

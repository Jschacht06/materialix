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
  /** True once the user renamed it, so re-uploading the file keeps their name */
  renamed?: boolean
  savedAt: number
  materials: Material[]
}

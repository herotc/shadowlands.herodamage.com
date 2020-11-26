import { writeFile } from 'fs'
import TrinketRaw from '../../src/assets/wow-data/raw/Trinket.json'

export function filterTrinket () {
  const trinketsSorted = TrinketRaw.sort((a, b) => a.name.localeCompare(b.name))
  const trinketsByName = {}
  for (const trinket of trinketsSorted) {
    const { name, itemId } = trinket
    if (!trinketsByName[name]) trinketsByName[name] = { itemId }
  }

  writeFile('src/assets/wow-data/Trinket.json', JSON.stringify(trinketsByName), (err) => { if (err) console.err(err) })
}

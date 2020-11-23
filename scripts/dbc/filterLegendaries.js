import { writeFile } from 'fs'
import LegendariesRaw from '../../src/assets/wow-data/raw/Legendaries.json'

export function filterLegendaries () {
  const legendariesSorted = LegendariesRaw.sort((a, b) => a.legendaryName.localeCompare(b.legendaryName))
  const legendaries = {}
  for (const legendary of legendariesSorted) {
    const { legendaryName: name, legendarySpellID: spellId } = legendary
    if (!legendaries[name]) legendaries[name] = { spellId }
  }

  writeFile('src/assets/wow-data/Legendaries.json', JSON.stringify(legendaries), (err) => { if (err) console.err(err) })
}

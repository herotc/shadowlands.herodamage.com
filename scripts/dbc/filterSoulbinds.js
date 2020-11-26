import { writeFile } from 'fs'
import ConduitsRaw from '../../src/assets/wow-data/raw/Conduits.json'
import SoulbindsRaw from '../../src/assets/wow-data/raw/Soulbinds.json'

export function filterSoulbinds () {
  // Soulbind Abilities
  const soulbindsFlattened = []
  for (const covenant of SoulbindsRaw) {
    for (const soulbind of covenant.soulbinds) {
      for (const [_, soulbindRow] of Object.entries(soulbind.soulbindTree)) {
        for (const [_, soulbindAbility] of Object.entries(soulbindRow)) {
          soulbindsFlattened.push(soulbindAbility)
        }
      }
    }
  }
  const soulbindsSorted = soulbindsFlattened.sort((a, b) => a.soulbindAbilityName.localeCompare(b.soulbindAbilityName))
  const soulbindsByName = {}
  for (const soulbind of soulbindsSorted) {
    const { soulbindAbilityName: name, soulbindAbilitySpellId: spellId } = soulbind
    if (!soulbindsByName[name]) soulbindsByName[name] = { spellId }
  }
  // Conduits
  const conduitsSorted = ConduitsRaw.sort((a, b) => a.conduitName.localeCompare(b.conduitName))
  for (const conduit of conduitsSorted) {
    const { conduitName: name, conduitSpellID: spellId } = conduit
    if (!soulbindsByName[name]) soulbindsByName[name] = { spellId }
  }

  writeFile('src/assets/wow-data/Soulbinds.json', JSON.stringify(soulbindsByName), (err) => { if (err) console.err(err) })
}

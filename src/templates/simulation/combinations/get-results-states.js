// Dependencies
import merge from 'lodash/merge'
import { getTalentsTree } from '../../../utils/wow/core'
import { wowTalentsLabel } from '../../../utils/wow/ui'

export function getResultsStates (props) {
  const { i18nPlugin: { lang }, pageContext } = props
  const { resultsRaw, spec, wowClass } = pageContext

  const jsonResults = JSON.parse(resultsRaw)

  // Iterate over the results to add some information
  const results = []
  const multiTargets = jsonResults[0].length === 5 // whether the results contains a bossDPS column
  const maxDPS = jsonResults[0][3] // used to compute the % Diff
  const selectedTalents = {} // used for talents filter
  for (let row of jsonResults) {
    // result filtering
    const rawTalentLabels = row[1]
    const rawLabels = row[2]
    const dps = row[3]
    const result = { rank: row[0], talents: rawTalentLabels, labels: rawLabels, dps }

    result.talentsLabel = wowTalentsLabel(rawTalentLabels, wowClass, spec, lang)

    if (multiTargets) result.bossDPS = row[4]
    result.dpsPercentageDifference = (100 * dps / maxDPS - 100).toFixed(1)

    results.push(result)

    // filter the talents to get the ones that can be selected
    for (let row = 0; row < rawTalentLabels.length; row++) {
      if (!selectedTalents[row]) selectedTalents[row] = {}
      const talentChar = parseInt(rawTalentLabels.charAt(row))
      if (talentChar !== 0) {
        const col = talentChar - 1
        if (!selectedTalents[row][col]) selectedTalents[row][col] = { selected: true }
      }
    }
  }

  // disable the talents that weren't found
  for (let rowId in selectedTalents) {
    for (let col = 0; col < 3; col++) {
      if (!selectedTalents[rowId][col]) {
        selectedTalents[rowId][col] = { disabled: true }
      }
    }
  }
  // merge the base talentsTree with the ones selected
  const defaultTalentsTree = getTalentsTree(wowClass, spec)
  const talentsTree = {}
  merge(talentsTree, defaultTalentsTree, selectedTalents)

  return { multiTargets, results, talentsTree }
}

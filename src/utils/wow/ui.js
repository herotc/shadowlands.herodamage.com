// Dependencies
import {
  getConsumableInformation,
  getLegendaryInformation,
  getSoulbindInformation,
  getTalentsMappingDifference,
  getTalentsTree,
  getTrinketInformation
} from './core'
import startCase from 'lodash/startCase'
import { defaultLang } from '../../../plugins/gatsby-plugin-herodamage-i18n'
// Assets
import wowClassDeathKnight from '../../assets/images/wow/classpicker/death_knight.svg'
import wowClassDemonHunter from '../../assets/images/wow/classpicker/demon_hunter.svg'
import wowClassDruid from '../../assets/images/wow/classpicker/druid.svg'
import wowClassHunter from '../../assets/images/wow/classpicker/hunter.svg'
import wowClassMage from '../../assets/images/wow/classpicker/mage.svg'
import wowClassMonk from '../../assets/images/wow/classpicker/monk.svg'
import wowClassPaladin from '../../assets/images/wow/classpicker/paladin.svg'
import wowClassPriest from '../../assets/images/wow/classpicker/priest.svg'
import wowClassRogue from '../../assets/images/wow/classpicker/rogue.svg'
import wowClassShaman from '../../assets/images/wow/classpicker/shaman.svg'
import wowClassWarlock from '../../assets/images/wow/classpicker/warlock.svg'
import wowClassWarrior from '../../assets/images/wow/classpicker/warrior.svg'

/**
 *
 * @param wowClass
 */
export function wowIcon (wowClass) {
  switch (wowClass) {
    case 'death-knight':
      return wowClassDeathKnight
    case 'demon-hunter':
      return wowClassDemonHunter
    case 'druid':
      return wowClassDruid
    case 'hunter':
      return wowClassHunter
    case 'mage':
      return wowClassMage
    case 'monk':
      return wowClassMonk
    case 'paladin':
      return wowClassPaladin
    case 'priest':
      return wowClassPriest
    case 'rogue':
      return wowClassRogue
    case 'shaman':
      return wowClassShaman
    case 'warlock':
      return wowClassWarlock
    case 'warrior':
      return wowClassWarrior
  }
}

/**
 *
 * @param t
 * @param spec
 * @param formatted
 * @returns {string}
 */
export function getSpec (t, spec, formatted = true) {
  return (formatted && startCase(t(spec))) || t(spec)
}

/**
 *
 * @param t
 * @param variation
 * @param formatted
 * @returns {string}
 */
export function getSpecVariation (t, variation, formatted = true) {
  return (formatted && startCase(t(variation))) || t(variation)
}

/**
 *
 * @param t
 * @param spec
 * @param variation
 * @param formatted
 * @returns {string}
 */
export function getSpecWithVariation (t, spec, variation, formatted = true) {
  const spec2 = getSpec(t, spec, formatted)
  const variation2 = getSpecVariation(t, variation, formatted)
  return (variation2 !== '' && `${spec2} ${variation2}`) || `${spec2}`
}

/**
 *
 * @param lang
 * @returns {string}
 */
const wowheadDomains = {
  de: 'de',
  en: 'www',
  es: 'es',
  fr: 'fr',
  it: 'it',
  ko: 'ko',
  pt: 'pt',
  ru: 'ru',
  zh: 'cn'
}

export function getWowheadDomain (lang) {
  return wowheadDomains[lang] || 'www'
}

/**
 *
 * @param lang
 * @returns {string}
 */
export function getWowheadLink (lang) {
  const wowheadDomain = getWowheadDomain(lang)
  return `https://${wowheadDomain}.wowhead.com/`
}

/**
 *
 * @param rawConsumableName
 * @param wowClass
 * @param spec
 * @param templateTalentsMapping
 * @param lang
 * @param container
 * @returns {string}
 */
export function wowConsumableLabel (rawConsumableName, wowClass, spec, templateTalentsMapping, lang = defaultLang, container = true) {
  // Split up the variations
  const parts = rawConsumableName.split('--')
  const consumable = getConsumableInformation(parts[0].split(' (')[0])

  let label
  if (consumable) {
    const { itemId } = consumable
    label = `<a href="${getWowheadLink(lang)}item=${itemId}">
      <span>${parts[0]}</span>
    </a>`
  } else {
    label = `${parts[0]}`
  }

  const variant = parts[0].split(' (')[1]
  if (variant) label += `&nbsp;(${variant}`
  // Add back the formatted variations
  if (parts[1]) {
    const variations = parts[1].split(';')
    const variationStrings = []
    for (const variation of variations) {
      const parts = variation.split(':')
      const variationName = parts[0]
      const variationValue = parts[1]
      switch (variationName) {
        case 'talents':
          const talents = getTalentsMappingDifference(templateTalentsMapping, variationValue)
          variationStrings.push(`${wowTalentsLabel(talents, wowClass, spec, lang)}`)
          break
      }
    }
    label += `&nbsp;|&nbsp;${variationStrings.join(' - ')}`
  }

  return (container && `<div class="label-container">${label}</div>`) || `${label}`
}

/**
 *
 * @param rawLegendaryName
 * @param wowClass
 * @param spec
 * @param templateTalentsMapping
 * @param lang
 * @param container
 * @returns {string}
 */
export function wowLegendaryLabel (rawLegendaryName, wowClass, spec, templateTalentsMapping, lang = defaultLang, container = true) {
  // Split up the variations
  const parts = rawLegendaryName.split('--')
  const legendary = getLegendaryInformation(parts[0].split(' (')[0])

  let label
  if (legendary) {
    const { spellId } = legendary
    label = `<a href="${getWowheadLink(lang)}spell=${spellId}">
      <span>${parts[0]}</span>
    </a>`
  } else {
    label = `${parts[0]}`
  }

  const variant = parts[0].split(' (')[1]
  if (variant) label += `&nbsp;(${variant}`
  // Add back the formatted variations
  if (parts[1]) {
    const variations = parts[1].split(';')
    const variationStrings = []
    for (const variation of variations) {
      const parts = variation.split(':')
      const variationName = parts[0]
      const variationValue = parts[1]
      switch (variationName) {
        case 'talents':
          const talents = getTalentsMappingDifference(templateTalentsMapping, variationValue)
          variationStrings.push(`${wowTalentsLabel(talents, wowClass, spec, lang)}`)
          break
      }
    }
    label += `&nbsp;|&nbsp;${variationStrings.join(' - ')}`
  }

  return (container && `<div class="label-container">${label}</div>`) || `${label}`
}

/**
 *
 * @param rawName
 * @param wowClass
 * @param spec
 * @param templateTalentsMapping
 * @param lang
 * @param container
 * @returns {string}
 */
export function wowRaceLabel (rawName, wowClass, spec, templateTalentsMapping, lang = defaultLang, container = true) {
  // Split up the variations
  const parts = rawName.split('--')

  let label = `${parts[0]}`
  // Add back the formatted variations
  if (parts[1]) {
    const variations = parts[1].split(';')
    const variationStrings = []
    for (const variation of variations) {
      const parts = variation.split(':')
      const variationName = parts[0]
      const variationValue = parts[1]
      switch (variationName) {
        case 'talents':
          const talents = getTalentsMappingDifference(templateTalentsMapping, variationValue)
          variationStrings.push(`${wowTalentsLabel(talents, wowClass, spec, lang)}`)
          break
      }
    }
    label += `&nbsp;|&nbsp;${variationStrings.join(' - ')}`
  }
  return (container && `<div class="label-container">${label}</div>`) || `${label}`
}

/**
 *
 * @param rawSoulbindName
 * @param wowClass
 * @param spec
 * @param templateTalentsMapping
 * @param lang
 * @param container
 * @returns {string}
 */
export function wowSoulbindLabel (rawSoulbindName, wowClass, spec, templateTalentsMapping, lang = defaultLang, container = true) {
  // Split up the variations
  const parts = rawSoulbindName.split('--')
  const soulbind = getSoulbindInformation(parts[0].split(' (')[0])

  let label
  if (soulbind) {
    const { spellId } = soulbind
    label = `<a href="${getWowheadLink(lang)}spell=${spellId}">
      <span>${parts[0]}</span>
    </a>`
  } else {
    label = `${parts[0]}`
  }

  const variant = parts[0].split(' (')[1]
  if (variant) label += `&nbsp;(${variant}`
  // Add back the formatted variations
  if (parts[1]) {
    const variations = parts[1].split(';')
    const variationStrings = []
    for (const variation of variations) {
      const parts = variation.split(':')
      const variationName = parts[0]
      const variationValue = parts[1]
      switch (variationName) {
        case 'talents':
          const talents = getTalentsMappingDifference(templateTalentsMapping, variationValue)
          variationStrings.push(`${wowTalentsLabel(talents, wowClass, spec, lang)}`)
          break
      }
    }
    label += `&nbsp;|&nbsp;${variationStrings.join(' - ')}`
  }

  return (container && `<div class="label-container">${label}</div>`) || `${label}`
}

/**
 *
 * @param rawItemName
 * @param wowClass
 * @param spec
 * @param templateTalentsMapping
 * @param lang
 * @param container
 * @returns {string}
 */
export function wowTrinketLabel (rawItemName, wowClass, spec, templateTalentsMapping, lang = defaultLang, container = true) {
  // Split up the variations
  const parts = rawItemName.split('--')
  const trinket = getTrinketInformation(parts[0].split(' (')[0])

  let label
  if (trinket) {
    const { itemId } = trinket
    label = `<a href="${getWowheadLink(lang)}item=${itemId}">
      <span>${parts[0]}</span>
    </a>`
  } else {
    label = `${parts[0]}`
  }

  const variant = parts[0].split(' (')[1]
  if (variant) label += `&nbsp;(${variant}`
  // Add back the formatted variations
  if (parts[1]) {
    const variations = parts[1].split(';')
    const variationStrings = []
    for (const variation of variations) {
      const parts = variation.split(':')
      const variationName = parts[0]
      const variationValue = parts[1]
      switch (variationName) {
        case 'talents':
          const talents = getTalentsMappingDifference(templateTalentsMapping, variationValue)
          variationStrings.push(`${wowTalentsLabel(talents, wowClass, spec, lang)}`)
          break
      }
    }
    label += `&nbsp;|&nbsp;${variationStrings.join(' - ')}`
  }

  return (container && `<div class="label-container">${label}</div>`) || `${label}`
}

/**
 *
 * @param talents
 * @param wowClass
 * @param spec
 * @param lang
 * @returns {string}
 */
export function wowTalentsLabel (talents, wowClass, spec, lang = defaultLang) {
  const talentsTree = getTalentsTree(wowClass, spec)
  let label = ''
  for (let row = 0; row < talents.length; row++) {
    const talentChar = parseInt(talents.charAt(row))
    if (talentChar !== 0) {
      const col = talentChar - 1
      const { spellId } = talentsTree[row][col]
      label += `<a href="${getWowheadLink(lang)}spell=${spellId}" data-wh-rename-link="false" style="display: inline-block; min-height: 18px; min-width: 18px;"></a>`
    }
  }
  return label
}

/**
 * Does refresh any Wowhead links in the DOM
 * @param firstCall
 */
export function refreshWowheadLinks (firstCall = true) {
  const WH = window.WH
  const $WowheadPower = window.$WowheadPower
  if (WH && WH.getLocaleFromDomain && $WowheadPower && $WowheadPower.refreshLinks) {
    $WowheadPower.refreshLinks()
    // Schedule a second refresh 500ms later since Wowhead might not always refresh every links.
    if (firstCall) {
      setTimeout(() => { refreshWowheadLinks(false) }, 500)
    }
  } else {
    setTimeout(refreshWowheadLinks, 250)
  }
}

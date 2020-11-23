import { createHash } from 'crypto'
import { readFile } from 'fs'
import { resolve } from 'path'
import { promisify } from 'util'
import { getWowClassIdAndSpecId } from '../../../src/utils/wow/core'
import * as mapping from './mapping'

// Until we get promisified version from fs (promises API is still experimental)
const readFilePromise = promisify(readFile)

export class ReportTransformer {
  constructor (node, actions) {
    this.node = node
    this.actions = actions
    this.reportFields = {} // Hold all the fields that will be registered
    this.extraFields = {} // Hold all the fields that will not be registered but can be used by the transformer

    const { name } = this.node
    const [simulationName, fightStyle, tier, wowClass, spec, variation] = name.toLowerCase().split('_')
    Object.assign(this.extraFields, { simulationName })

    const { simulationFeaturedOrder, simulationCategory, simulationType, simulationTypeOrder, simulationTemplate } = mapping.simulationDetails[simulationName]
    let slug = `/${wowClass}/${simulationType}/${fightStyle}-${tier}-${spec}`
    if (variation) slug += `-${variation}`
    Object.assign(this.reportFields, {
      slug, // '/death-knight/trinkets/1t-t21-frost-cold-heart-runic-attenuation'
      name, // 'TrinketSimulation_1T_T21_Death-Knight_Frost_Cold-Heart-Runic-Attenuation'
      wowClass, // 'death-knight'
      simulationFeaturedOrder: simulationFeaturedOrder, // 3
      simulationCategory, // 'trinkets'
      simulationType, // 'trinkets'
      simulationTypeOrder, // null
      simulationTemplate, // 'trinkets'
      tier, // 't21'
      spec, // 'frost'
      variation: variation || '', // 'cold-heart-runic-attenuation'
      fightStyle // '1t'
    })
  }

  /*
  |=====================================================================================================================
  | generateReportNode
  |=====================================================================================================================
  */

  /**
   *
   * @returns {Promise<void>}
   */
  async extractDataFromFile () {
    const { absolutePath, name } = this.node
    const { simulationType } = this.reportFields

    // Fetch the report file
    let report
    try {
      const jsonFile = await readFilePromise(absolutePath, { encoding: 'utf8', flag: 'r' })
      report = JSON.parse(jsonFile)
    } catch (err) {
      console.error(`Error while processing the '${name}' report:`, err)
      return
    }
    const { metas, results } = report
    Object.assign(this.extraFields, { results })

    Object.assign(this.reportFields, {
      resultsRaw: JSON.stringify(results),
      fightLength: metas.fightLength,
      fightLengthVariation: metas.fightLengthVariation,
      targetError: metas.targetError,
      templateGear: metas.templateGear,
      templateTalents: metas.templateTalents,
      templateDPS: metas.templateDPS,
      elapsedTime: metas.elapsedTime,
      totalEventsProcessed: metas.totalEventsProcessed,
      totalIterations: metas.totalIterations,
      totalActors: metas.totalActors,
      simcBuildTimestamp: metas.simcBuildTimestamp,
      simcGitRevision: metas.simcGitRevision || '',
      wowVersion: metas.wowVersion
    })
  }

  generateAdditionalReportFields () {
    const { fightStyle, simulationType, spec, tier, wowClass } = this.reportFields
    const { results } = this.extraFields

    // TODO: Generate MoreTooltipInfo Import String
  }

  registerPagesDetails () {
    const { wowClasses, simulationsName, fightStyles, tiers, reportFieldsName } = ReportTransformer.pagesDetails
    const { wowClass, fightStyle, tier } = this.reportFields
    const { simulationName } = this.extraFields

    // Used to create WoW classes & Performance pages
    if (!wowClasses.includes(wowClass)) wowClasses.push(wowClass)
    if (!simulationsName.includes(simulationName)) simulationsName.push(simulationName)
    if (!fightStyles.includes(fightStyle)) fightStyles.push(fightStyle)
    if (!tiers.includes(tier)) tiers.push(tier)

    // Used to automatically retrieve all reportFields registered through the transformer in the simulation query
    for (const nodeFieldName of Object.keys(this.reportFields)) {
      if (!reportFieldsName.includes(nodeFieldName)) reportFieldsName.push(nodeFieldName)
    }
  }

  createNodeFields () {
    const node = this.node
    const { createNode, createParentChildLink } = this.actions
    const fields = this.reportFields

    const nodeData = {
      id: `${node.id} >>> HeroDamageReport`,
      parent: node.id,
      children: [],
      internal: {
        type: 'HeroDamageReport',
        contentDigest: createHash('md5').update(JSON.stringify(fields)).digest('hex'),
        description: 'Node representing the data from the json reports processed by the reports plugin.'
      },
      reportFields: { ...fields }
    }
    createNode(nodeData)
    createParentChildLink({ parent: node, child: nodeData })
  }

  /**
   *
   * @returns {Promise<void>}
   */
  async generateReportNode () {
    await this.extractDataFromFile()
    this.generateAdditionalReportFields()
    this.createNodeFields()
    this.registerPagesDetails()
  }

  /*
  |=====================================================================================================================
  | createPages
  |=====================================================================================================================
  */

  /**
   *
   * @param api
   * @returns {Promise<void>}
   */
  static async createPages (api) {
    const { graphql, actions: { createPage } } = api
    const { wowClasses, simulationsName, fightStyles, tiers, reportFieldsName } = ReportTransformer.pagesDetails

    // WoW classes
    for (const wowClass of wowClasses) {
      const slug = `/${wowClass}/`
      createPage({ path: slug, component: resolve('./src/templates/wow-class.js'), context: { slug, wowClass } })
    }

    // SimC Performance
    // for (const simulationName of simulationsName) {
    //   for (const fightStyle of fightStyles) {
    //     for (const tier of tiers) {
    //       const { simulationFeaturedOrder, simulationCategory, simulationType, simulationTypeOrder } = mapping.simulationDetails[simulationName]
    //       const slug = `/simc-performance/${simulationType}/${fightStyle}-${tier}`
    //       createPage({
    //         path: slug,
    //         component: resolve('./src/templates/simc-performance.js'),
    //         context: {
    //           slug,
    //           simulationFeaturedOrder,
    //           simulationCategory,
    //           simulationType,
    //           simulationTypeOrder,
    //           fightStyle,
    //           tier
    //         }
    //       })
    //     }
    //   }
    // }

    // Simulations
    const result = await graphql(`
      {
        allHeroDamageReport {
          edges {
            node {
              reportFields {
                ${reportFieldsName.join(' ')}
              }
            }
          }
        }
      }
    `)
    const { data: { allHeroDamageReport: { edges } } } = result
    edges.forEach(({ node: { reportFields } }) => {
      const { slug, simulationTemplate } = reportFields
      createPage({
        path: slug,
        component: resolve(`./src/templates/simulation/${simulationTemplate}.js`),
        context: reportFields
      })
    })
  }
}

/**
 * Hold all the details to create the pages
 * @type {{wowClasses: Array, simulationsName: Array, fightStyles: Array, tiers: Array, reportFieldsName: Array}}
 */
ReportTransformer.pagesDetails = {
  wowClasses: [],
  simulationsName: [],
  fightStyles: [],
  tiers: [],
  reportFieldsName: []
}

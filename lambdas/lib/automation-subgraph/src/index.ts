import request from 'graphql-request'
import {
  TriggersDocument,
  TriggersQuery,
  TriggerByTypeQuery,
  TriggerByTypeDocument,
} from './types/graphql/generated'
import { ChainId } from 'shared/domain-types'
import { Logger } from '@aws-lambda-powertools/logger'

const chainIdSubgraphMap: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: 'summer-automation',
}

const getEndpoint = (chainId: ChainId, baseUrl: string) => {
  const subgraph = chainIdSubgraphMap[chainId]
  if (!subgraph) {
    throw new Error(`No subgraph for chainId ${chainId}`)
  }
  return `${baseUrl}/${subgraph}`
}
interface SubgraphClientConfig {
  chainId: ChainId
  urlBase: string
  logger?: Logger
}

export interface GetTriggersParams {
  wallet: string
  dpm: string
}

export interface GetOneTriggerParams {
  dpm: string
  triggerType: bigint
}

export type GetTriggers = (params: GetTriggersParams) => Promise<TriggersQuery>

export type GetOneTrigger = (params: GetOneTriggerParams) => Promise<TriggerByTypeQuery>

async function getTriggers(params: GetTriggersParams, config: SubgraphClientConfig) {
  const url = getEndpoint(ChainId.MAINNET, config.urlBase)
  const triggers = await request(url, TriggersDocument, {
    wallet: params.wallet,
    dpm: params.dpm,
  })

  config.logger?.debug('Received triggers for account', { account: params.dpm, triggers })

  return triggers
}

async function getOneTrigger(params: GetOneTriggerParams, config: SubgraphClientConfig) {
  const url = getEndpoint(config.chainId, config.urlBase)
  const trigger = await request(url, TriggerByTypeDocument, {
    dpm: params.dpm,
    triggerType: params.triggerType.toString(),
  })

  config.logger?.debug('Received trigger for account', { account: params.dpm, trigger })

  return trigger
}

export interface AutomationSubgraphClient {
  getTriggers: GetTriggers
  getOneTrigger: GetOneTrigger
}

export function getAutomationSubgraphClient(
  config: SubgraphClientConfig,
): AutomationSubgraphClient {
  return {
    getTriggers: (params: GetTriggersParams) => getTriggers(params, config),
    getOneTrigger: (params: GetOneTriggerParams) => getOneTrigger(params, config),
  }
}

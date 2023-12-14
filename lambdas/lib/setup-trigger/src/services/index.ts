import { ChainId, NetworkByChainID, ProtocolId } from 'shared/domain-types'
import { Addresses, getAddresses } from './get-addresses'
import { Chain, createPublicClient, http } from 'viem'
import { arbitrum, base, mainnet, optimism, sepolia } from 'viem/chains'
import { Logger } from '@aws-lambda-powertools/logger'
import { getPosition, GetPositionParams } from './get-position'
import { SimulatedPosition, simulatePosition, SimulatePositionParams } from './simulate-position'
import { triggerEncoders } from './trigger-encoders'
import {
  EventBody,
  PositionLike,
  SupportedTriggers,
  AaveAutoBuyTriggerData,
  TriggerData,
  isAaveAutoBuyTriggerData,
  isAaveAutoSellTriggerData,
  Price,
  isBigInt,
} from '~types'
import { calculateCollateralPriceInDebtBasedOnLtv } from './calculate-collateral-price-in-debt-based-on-ltv'
import {
  encodeFunctionForDpm,
  EncodeFunctionForDpmParams,
  TransactionFragment,
} from './encode-function-for-dpm'
import { validateTriggerDataAgainstCurrentPosition } from './validate-trigger-data-against-current-position'
import { CurrentTriggerLike, EncodedFunction } from './trigger-encoders/types'
import type { GetTriggersResponse } from 'contracts/get-triggers-response'

const rpcConfig = {
  skipCache: false,
  skipMulticall: false,
  skipGraph: true,
  stage: 'prod',
  source: 'borrow-prod',
}

function getRpcGatewayEndpoint(chainId: ChainId, rpcGateway: string) {
  const network = NetworkByChainID[chainId]
  return (
    `${rpcGateway}/?` +
    `network=${network}&` +
    `skipCache=${rpcConfig.skipCache}&` +
    `skipMulticall=${rpcConfig.skipMulticall}&` +
    `skipGraph=${rpcConfig.skipGraph}&` +
    `source=${rpcConfig.source}`
  )
}

const domainChainIdToViemChain: Record<ChainId, Chain> = {
  [ChainId.MAINNET]: mainnet,
  [ChainId.ARBITRUM]: arbitrum,
  [ChainId.OPTIMISM]: optimism,
  [ChainId.BASE]: base,
  [ChainId.SEPOLIA]: sepolia,
}

export interface ServiceContainer {
  getPosition: (params: GetPositionParams) => Promise<PositionLike>
  simulatePosition: (params: SimulatePositionParams) => SimulatedPosition
  getExecutionPrice: (params: PositionLike) => Price
  validate: typeof validateTriggerDataAgainstCurrentPosition
  encodeTrigger: (position: PositionLike, triggerData: TriggerData) => Promise<EncodedFunction>
  encodeForDPM: (params: EncodeFunctionForDpmParams) => TransactionFragment
}

export function buildServiceContainer(
  chainId: ChainId,
  protocol: ProtocolId,
  trigger: SupportedTriggers,
  rpcGateway: string,
  getTriggersUrl: string,
  forkRpc?: string,
  logger?: Logger,
): ServiceContainer {
  const rpc = forkRpc ?? getRpcGatewayEndpoint(chainId, rpcGateway)
  const transport = http(rpc, {
    batch: false,
    fetchOptions: {
      method: 'POST',
    },
  })

  const publicClient = createPublicClient({
    transport,
    chain: domainChainIdToViemChain[chainId],
  })

  const addresses = getAddresses(chainId)

  return {
    getPosition: (params: Parameters<typeof getPosition>[0]) => {
      return getPosition(params, publicClient, addresses, logger)
    },
    simulatePosition: (params: Parameters<typeof simulatePosition>[0]) => {
      return simulatePosition(params, logger)
    },
    getExecutionPrice: (params: Parameters<typeof calculateCollateralPriceInDebtBasedOnLtv>[0]) => {
      return calculateCollateralPriceInDebtBasedOnLtv(params)
    },
    validate: validateTriggerDataAgainstCurrentPosition,
    encodeTrigger: async (position: PositionLike, triggerData: TriggerData) => {
      let currentTrigger: CurrentTriggerLike | undefined = undefined
      try {
        const triggers = await fetch(`${getTriggersUrl}?chainId=${chainId}&dpm=${position.address}`)
        const triggersJson = (await triggers.json()) as GetTriggersResponse
        const autoBuy = triggersJson.triggers.aaveBasicBuy
        // TODO: For now, let's asume we want just auto-buy
        if (autoBuy) {
          currentTrigger = {
            triggerData: autoBuy.triggerData as `0x${string}`,
            id: isBigInt(autoBuy.triggerId) ? BigInt(autoBuy.triggerId) : 0n,
          }
        }
      } catch (e) {
        logger?.error('Error fetching triggers', { error: e, position })
        throw e
      }

      if (isAaveAutoBuyTriggerData(triggerData)) {
        return triggerEncoders[ProtocolId.AAVE3][SupportedTriggers.AutoBuy](
          position,
          triggerData,
          currentTrigger,
        )
      }
      if (isAaveAutoSellTriggerData(triggerData)) {
        return triggerEncoders[ProtocolId.AAVE3][SupportedTriggers.AutoSell](
          position,
          triggerData,
          currentTrigger,
        )
      }
      throw new Error('Unsupported trigger data')
    },
    encodeForDPM: (params: EncodeFunctionForDpmParams) => {
      return encodeFunctionForDpm(params, addresses)
    },
  }
}

import { ChainId, NetworkByChainID, ProtocolId } from 'shared/domain-types'
import { Addresses, getAddresses } from './get-addresses'
import { Chain, createPublicClient, http } from 'viem'
import { arbitrum, base, mainnet, optimism, sepolia } from 'viem/chains'
import { Logger } from '@aws-lambda-powertools/logger'
import { getPosition } from './get-position'
import { simulatePosition } from './simulate-position'
import { triggerEncoders } from './trigger-encoders'
import {
  EventBody,
  PositionLike,
  SupportedTriggers,
  AaveAutoBuyTriggerData,
  TriggerData,
  isAaveAutoBuyTriggerData,
  isAaveAutoSellTriggerData,
} from '~types'
import { calculateCollateralPriceInDebtBasedOnLtv } from './calculate-collateral-price-in-debt-based-on-ltv'
import { encodeFunctionForDpm } from './encode-function-for-dpm'
import { getAutomationSubgraphClient } from 'automation-subgraph'
import { validateTriggerDataAgainstCurrentPosition } from './validate-trigger-data-against-current-position'

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

export function buildServiceContainer(
  chainId: ChainId,
  protocol: ProtocolId,
  trigger: SupportedTriggers,
  rpcGateway: string,
  subgraphUrl: string,
  forkRpc?: string,
  logger?: Logger,
) {
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

  const automationSubgraphClient = getAutomationSubgraphClient({
    urlBase: subgraphUrl,
    chainId,
    logger,
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
      const queryResult = await automationSubgraphClient.getOneTrigger({
        dpm: position.address,
        triggerType: triggerData.type,
      })
      const currentTrigger = queryResult.triggers[0]
        ? {
            id: BigInt(queryResult.triggers[0].id),
            triggerData: queryResult.triggers[0].triggerData as `0x${string}`,
          }
        : undefined

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
    encodeForDPM: (params: Parameters<typeof encodeFunctionForDpm>[0]) => {
      return encodeFunctionForDpm(params, addresses)
    },
  }
}

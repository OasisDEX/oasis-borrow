import { networkSetById } from 'blockchain/networks'
import type { SetupAutomationCommonParams } from 'helpers/lambda/triggers'
import type { SetupTriggerPath } from 'helpers/lambda/triggers/common'
import { supportedLambdaProtocolsList } from 'helpers/lambda/triggers/common'
import { LendingProtocol } from 'lendingProtocols'

export interface GetSetupTriggerConfigParams extends SetupAutomationCommonParams {
  path: SetupTriggerPath
}

export const getSetupTriggerConfig = (params: GetSetupTriggerConfigParams) => {
  if (!supportedLambdaProtocolsList.includes(params.protocol)) {
    throw new Error(
      `Only protocols supported for getting trigger data from API: ${supportedLambdaProtocolsList.join(
        ',',
      )}`,
    )
  }

  const networkConfig = networkSetById[params.networkId]
  const rpc = networkConfig?.isCustomFork ? networkConfig.rpcUrl : undefined

  return {
    common: {
      dpm: params.dpm,
      protocol: params.protocol,
      position: {
        collateral: params.strategy.collateralAddress,
        debt: params.strategy.debtAddress,
      },
      rpc,
      action: params.action,
    },
    poolId: params.poolId,
    url: `/api/triggers/${params.networkId}/${
      {
        [LendingProtocol.AaveV3]: 'aave3',
        [LendingProtocol.MorphoBlue]: 'morphoblue',
        [LendingProtocol.SparkV3]: 'spark',
      }[params.protocol]
    }/${params.path}`,
  }
}

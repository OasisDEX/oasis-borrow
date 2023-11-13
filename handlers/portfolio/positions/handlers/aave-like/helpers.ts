import type { AaveV3SupportedNetwork } from 'blockchain/aave-v3'
import { getAaveV3ReserveConfigurationData, getAaveV3ReserveData } from 'blockchain/aave-v3'
import { NetworkIds, networksById } from 'blockchain/networks'
import type { SparkV3SupportedNetwork } from 'blockchain/spark-v3'
import { getSparkV3ReserveConfigurationData, getSparkV3ReserveData } from 'blockchain/spark-v3'
import { OmniProductType } from 'features/omni-kit/types'
import { getPositionsAutomations } from 'handlers/portfolio/positions/helpers'
import type { DpmList } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import type { AutomationResponse } from 'handlers/portfolio/positions/helpers/getAutomationData'
import { getTokenName } from 'handlers/portfolio/positions/helpers/getTokenName'
import { LendingProtocol } from 'lendingProtocols'

export const filterAutomation = (dpm: DpmList[number]) => (position: AutomationResponse[number]) =>
  position.triggers.account.toLowerCase() === dpm.id.toLowerCase() &&
  !position.triggers.executedBlock &&
  !position.triggers.removedBlock

export const getReserveDataCall = (dpm: DpmList[number], token: string) => {
  switch (dpm.protocol) {
    case 'AAVE_V3':
      return getAaveV3ReserveData({
        networkId: dpm.networkId as AaveV3SupportedNetwork,
        token,
      })
    case 'Spark':
      return getSparkV3ReserveData({
        networkId: dpm.networkId as SparkV3SupportedNetwork,
        token,
      })
    default:
      throw new Error(`Unsupported protocol ${dpm.protocol}`)
  }
}

export const getReserveConfigurationDataCall = (dpm: DpmList[number], token: string) => {
  switch (dpm.protocol) {
    case 'AAVE_V3':
      return getAaveV3ReserveConfigurationData({
        networkId: dpm.networkId as AaveV3SupportedNetwork,
        token,
      })
    case 'Spark':
      return getSparkV3ReserveConfigurationData({
        networkId: dpm.networkId as SparkV3SupportedNetwork,
        token,
      })
    default:
      throw new Error(`Unsupported protocol ${dpm.protocol}`)
  }
}

export const commonDataMapper = (
  dpm: DpmList[number],
  automations?: AutomationResponse[number],
  positionIdAsString?: boolean,
) => ({
  dpmId: dpm.id,
  positionId: positionIdAsString ? dpm.vaultId : Number(dpm.vaultId),
  type: dpm.positionType,
  network: networksById[dpm.networkId].name,
  protocol: {
    AAVE_V3: LendingProtocol.AaveV3,
    Spark: LendingProtocol.SparkV3,
    [LendingProtocol.AaveV2]: LendingProtocol.AaveV2,
  }[dpm.protocol] as LendingProtocol,
  primaryToken: getTokenName(dpm.networkId, dpm.collateralToken),
  secondaryToken: getTokenName(dpm.networkId, dpm.debtToken),
  url: `/${networksById[dpm.networkId].name.toLowerCase()}/${
    {
      AAVE_V3: 'aave',
      Spark: 'spark',
      [LendingProtocol.AaveV2]: 'aave',
    }[dpm.protocol]
  }/${
    {
      AAVE_V3: 'v3',
      Spark: 'v3',
      [LendingProtocol.AaveV2]: 'v2',
    }[dpm.protocol]
  }/${dpm.vaultId}`,
  automations: {
    ...(dpm.positionType !== OmniProductType.Earn &&
      automations && {
        autoBuy: { enabled: false },
        autoSell: { enabled: false },
        stopLoss: { enabled: false },
        takeProfit: { enabled: false },
        ...getPositionsAutomations({
          networkId: NetworkIds.MAINNET,
          triggers: [automations.triggers],
        }),
      }),
  },
})

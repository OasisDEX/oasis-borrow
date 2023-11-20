import type { Vault } from '@prisma/client'
import BigNumber from 'bignumber.js'
import type { AaveV3SupportedNetwork } from 'blockchain/aave-v3'
import { getAaveV3ReserveConfigurationData, getAaveV3ReserveData } from 'blockchain/aave-v3'
import { NetworkIds, networksById } from 'blockchain/networks'
import type { SparkV3SupportedNetwork } from 'blockchain/spark-v3'
import { getSparkV3ReserveConfigurationData, getSparkV3ReserveData } from 'blockchain/spark-v3'
import type { OmniProductBorrowishType } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import type { TokensPrices } from 'handlers/portfolio/positions/helpers'
import {
  getBorrowishPositionType,
  getPositionsAutomations,
} from 'handlers/portfolio/positions/helpers'
import type { DpmList } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import type { AutomationResponse } from 'handlers/portfolio/positions/helpers/getAutomationData'
import { getTokenName } from 'handlers/portfolio/positions/helpers/getTokenName'
import { getTokenDisplayName } from 'helpers/getTokenDisplayName'
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

interface CommonDataMapperParams {
  automations?: AutomationResponse[number]
  dpm: DpmList[number]
  positionIdAsString?: boolean
  prices: TokensPrices
  apiVaults?: Vault[]
}

export const commonDataMapper = ({
  automations,
  dpm,
  positionIdAsString,
  prices,
  apiVaults,
}: CommonDataMapperParams) => {
  const primaryToken = getTokenName(dpm.networkId, dpm.collateralToken)
  const secondaryToken = getTokenName(dpm.networkId, dpm.debtToken)
  const protocol = {
    AAVE_V3: LendingProtocol.AaveV3,
    Spark: LendingProtocol.SparkV3,
    AAVE: LendingProtocol.AaveV2, // this means Aave V2
  }[dpm.protocol] as LendingProtocol
  const positionType = apiVaults
    ? getBorrowishPositionType({
        apiVaults,
        networkId: dpm.networkId,
        positionId: Number(dpm.vaultId),
        protocol,
        defaultType: dpm.positionType as OmniProductBorrowishType,
      })
    : dpm.positionType

  return {
    commonData: {
      positionId: positionIdAsString ? dpm.vaultId : Number(dpm.vaultId),
      type: positionType,
      network: networksById[dpm.networkId].name,
      protocol,
      primaryToken: getTokenDisplayName(primaryToken),
      secondaryToken: getTokenDisplayName(secondaryToken),
      url: `/${networksById[dpm.networkId].name.toLowerCase()}/${
        {
          AAVE_V3: 'aave',
          Spark: 'spark',
          AAVE: 'aave',
        }[dpm.protocol]
      }/${
        {
          AAVE_V3: 'v3',
          Spark: 'v3',
          AAVE: 'v2',
        }[dpm.protocol]
      }/${dpm.vaultId}`,
      automations: {
        ...(dpm.positionType !== OmniProductType.Earn &&
          automations && {
            stopLoss: { enabled: false },
            ...getPositionsAutomations({
              networkId: NetworkIds.MAINNET,
              triggers: [automations.triggers],
            }),
          }),
      },
    },
    primaryTokenPrice: new BigNumber(prices[primaryToken]),
    secondaryTokenPrice: new BigNumber(prices[secondaryToken]),
  }
}

import type { Vault } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { getAaveV2ReserveConfigurationData, getAaveV2ReserveData } from 'blockchain/aave'
import type { AaveV3SupportedNetwork } from 'blockchain/aave-v3'
import { getAaveV3ReserveConfigurationData, getAaveV3ReserveData } from 'blockchain/aave-v3'
import type { NetworkIds } from 'blockchain/networks'
import { networksById } from 'blockchain/networks'
import type { SparkV3SupportedNetwork } from 'blockchain/spark-v3'
import { getSparkV3ReserveConfigurationData, getSparkV3ReserveData } from 'blockchain/spark-v3'
import type { OmniProductBorrowishType } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { emptyAutomations } from 'handlers/portfolio/constants'
import type { AaveLikeOraclePriceData } from 'handlers/portfolio/positions/handlers/aave-like/types'
import type { TokensPricesList } from 'handlers/portfolio/positions/helpers'
import {
  getBorrowishPositionType,
  getPositionsAutomations,
} from 'handlers/portfolio/positions/helpers'
import type { DpmSubgraphData } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import type { AutomationResponse } from 'handlers/portfolio/positions/helpers/getAutomationData'
import { getTokenName } from 'handlers/portfolio/positions/helpers/getTokenName'
import { getTokenDisplayName } from 'helpers/getTokenDisplayName'
import { LendingProtocol } from 'lendingProtocols'

export const filterAutomation = (dpm: DpmSubgraphData) => (position: AutomationResponse[number]) =>
  position.triggers.account.toLowerCase() === dpm.id.toLowerCase()

export const getReserveDataCall = (dpm: DpmSubgraphData, token: string) => {
  switch (dpm.protocol) {
    case 'AAVE_V3':
    case 'aavev3':
      return getAaveV3ReserveData({
        networkId: dpm.networkId as AaveV3SupportedNetwork,
        token,
      })
    case 'aavev2':
      return getAaveV2ReserveData({
        token,
      })
    case 'Spark':
    case 'sparkv3':
      return getSparkV3ReserveData({
        networkId: dpm.networkId as SparkV3SupportedNetwork,
        token,
      })
    default:
      throw new Error(`Unsupported protocol ${dpm.protocol}`)
  }
}

export const getReserveConfigurationDataCall = (dpm: DpmSubgraphData, token: string) => {
  switch (dpm.protocol) {
    case 'AAVE_V3':
    case 'aavev3':
      return getAaveV3ReserveConfigurationData({
        networkId: dpm.networkId as AaveV3SupportedNetwork,
        token,
      })
    case 'aavev2':
      return getAaveV2ReserveConfigurationData({ token })
    case 'Spark':
    case 'sparkv3':
      return getSparkV3ReserveConfigurationData({
        networkId: dpm.networkId as SparkV3SupportedNetwork,
        token,
      })
    default:
      throw new Error(`Unsupported protocol ${dpm.protocol}`)
  }
}

interface CommonDataMapperParams {
  automations?: AutomationResponse[number]['triggers'][]
  dpm: DpmSubgraphData
  positionIdAsString?: boolean
  prices: TokensPricesList
  apiVaults?: Vault[]
  allOraclePrices?: AaveLikeOraclePriceData
  debug?: boolean
}

export const commonDataMapper = ({
  automations,
  dpm,
  positionIdAsString,
  prices,
  apiVaults,
  allOraclePrices,
  debug,
}: CommonDataMapperParams) => {
  const primaryToken = getTokenName(dpm.networkId, dpm.collateralToken)
  const secondaryToken = getTokenName(dpm.networkId, dpm.debtToken)
  // these token prices are separated for debugging purposes
  const primaryTokenOraclePrice = allOraclePrices?.find(
    (oraclePrice) => oraclePrice?.tokenSymbol.toLowerCase() === primaryToken.toLowerCase(),
  )?.price
  const primaryTokenTickerPrice = new BigNumber(prices[primaryToken])
  const secondaryTokenOraclePrice = allOraclePrices?.find(
    (oraclePrice) => oraclePrice?.tokenSymbol.toLowerCase() === secondaryToken.toLowerCase(),
  )?.price
  const secondaryTokenTickerPrice = new BigNumber(prices[secondaryToken])

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
  const emptyAutomationsList = {
    AAVE: {},
    Spark: emptyAutomations,
    AAVE_V3: emptyAutomations,
  }[dpm.protocol]
  const primaryTokenSymbol = getTokenDisplayName(primaryToken)
  const secondaryTokenSymbol = getTokenDisplayName(secondaryToken)
  const omniKitUrl = `/${networksById[dpm.networkId].name.toLowerCase()}/${
    {
      AAVE_V3: 'aave/v3',
      AAVE: 'aave/v2',
      Spark: 'spark',
    }[dpm.protocol]
  }/${positionType}/${primaryTokenSymbol.toLocaleLowerCase()}-${secondaryTokenSymbol.toLocaleLowerCase()}/${
    dpm.vaultId
  }`
  return {
    commonData: {
      positionId: positionIdAsString ? dpm.vaultId : Number(dpm.vaultId),
      type: positionType,
      network: networksById[dpm.networkId].name,
      protocol,
      primaryToken: primaryTokenSymbol,
      secondaryToken: secondaryTokenSymbol,
      url: omniKitUrl,
      automations: {
        ...(dpm.positionType !== OmniProductType.Earn
          ? {
              ...getPositionsAutomations({
                triggers: automations ?? [],
                defaultList: emptyAutomationsList,
              }),
            }
          : {}),
      },
    },
    primaryTokenPrice: primaryTokenOraclePrice || primaryTokenTickerPrice,
    secondaryTokenPrice: secondaryTokenOraclePrice || secondaryTokenTickerPrice,
    ...(debug && {
      primaryTokenOraclePrice,
      primaryTokenTickerPrice,
      secondaryTokenOraclePrice,
      secondaryTokenTickerPrice,
      primaryTokenOraclePriceMissing: !primaryTokenOraclePrice,
      secondaryTokenOraclePriceMissing: !secondaryTokenOraclePrice,
    }),
  }
}

export const aaveLikeProtocolNames = {
  [LendingProtocol.AaveV3]: 'AAVE_V3',
  [LendingProtocol.SparkV3]: 'Spark',
}

export const uniqueTokensReducer = (
  acc: Record<NetworkIds, string[]>,
  {
    networkId,
    debtToken,
    collateralToken,
  }: { networkId: NetworkIds; debtToken: string; collateralToken: string },
) => {
  if (!acc[networkId]) {
    acc[networkId] = []
  }
  if (!acc[networkId].includes(debtToken)) {
    acc[networkId].push(debtToken)
  }
  if (!acc[networkId].includes(collateralToken)) {
    acc[networkId].push(collateralToken)
  }
  return acc
}

export const formatBigNumberDebugData = (data: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      BigNumber.isBigNumber(value) ? value.toString() : value,
    ]),
  )

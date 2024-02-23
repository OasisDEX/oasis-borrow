import type { AaveLikePositionV2, Tokens } from '@oasisdex/dma-library'
import { views } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import type { GetOnChainPositionParams } from 'actions/aave-like/types'
import type BigNumber from 'bignumber.js'
import { getRpcProvider } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { getAaveHistoryEvents } from 'features/aave/services'
import { getReserveDataCall } from 'handlers/portfolio/positions/handlers/aave-like/helpers'
import type { DpmSubgraphData } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import { LendingProtocol } from 'lendingProtocols'
import { useAaveContext } from 'features/aave'
import { useObservable } from 'helpers/observableHook'

export async function getOnChainPositionOmni({
  networkId,
  proxyAddress,
  collateralToken,
  debtToken,
  protocol,
  collateralPrice,
  debtPrice,
}: GetOnChainPositionParams & {
  collateralPrice: BigNumber
  debtPrice: BigNumber
}): Promise<AaveLikePositionV2> {

  const provider = getRpcProvider(networkId)

  const _collateralToken = {
    symbol: collateralToken as Tokens,
    precision: getToken(collateralToken).precision,
  }

  const _debtToken = {
    symbol: debtToken as Tokens,
    precision: getToken(debtToken).precision,
  }

  const dpm = {
    protocol: protocol as LendingProtocol,
    networkId,
  } as DpmSubgraphData

  const [
    // primaryTokenReserveConfiguration,
    primaryTokenReserveData,
    secondaryTokenReserveData,
    aggregatedData,
  ] = await Promise.all([
    // getReserveConfigurationDataCall(dpm, collateralToken),
    getReserveDataCall(dpm, collateralToken),
    getReserveDataCall(dpm, debtToken),
    getAaveHistoryEvents(proxyAddress, networkId),
  ])

  switch (protocol) {
    case LendingProtocol.AaveV2:
      const addressesV2 = getAddresses(networkId, LendingProtocol.AaveV2)
      return await views.aave.omni.v2(
        {
          proxy: proxyAddress,
          collateralToken: _collateralToken,
          debtToken: _debtToken,
          primaryTokenReserveData,
          secondaryTokenReserveData,
          cumulatives: aggregatedData.positionCumulatives,
          collateralPrice,
          debtPrice,
        },
        { addresses: addressesV2, provider },
      )
    case LendingProtocol.AaveV3:
      const addressesV3 = getAddresses(networkId, LendingProtocol.AaveV3)
      return await views.aave.omni.v3(
        {
          proxy: proxyAddress,
          collateralToken: _collateralToken,
          debtToken: _debtToken,
          primaryTokenReserveData,
          secondaryTokenReserveData,
          cumulatives: aggregatedData.positionCumulatives,
          collateralPrice,
          debtPrice,
        },
        { addresses: addressesV3, provider },
      )
    case LendingProtocol.SparkV3:
      const addressesSpark = getAddresses(networkId, LendingProtocol.SparkV3)
      return await views.sparkOmni(
        {
          proxy: proxyAddress,
          collateralToken: _collateralToken,
          debtToken: _debtToken,
          primaryTokenReserveData,
          secondaryTokenReserveData,
          cumulatives: aggregatedData.positionCumulatives,
          collateralPrice,
          debtPrice,
        },
        { addresses: addressesSpark, provider },
      )
    default:
      throw new Error('Protocol not supported')
  }
}

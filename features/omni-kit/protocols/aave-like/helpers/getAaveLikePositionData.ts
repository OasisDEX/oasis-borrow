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
import type { AaveLikeServices } from 'lendingProtocols/aave-like-common'
import type { Observable } from 'rxjs'
import { combineLatest, from } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export function getAaveLikePositionData$({
  networkId,
  proxyAddress,
  collateralToken,
  debtToken,
  protocol,
  collateralPrice,
  debtPrice,
  services,
}: GetOnChainPositionParams & {
  collateralPrice: BigNumber
  debtPrice: BigNumber
  services: AaveLikeServices
}): Observable<AaveLikePositionV2> {
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
    protocol,
    networkId,
  } as DpmSubgraphData

  return combineLatest(
    from(getReserveDataCall(dpm, collateralToken)),
    from(getReserveDataCall(dpm, debtToken)),
    from(getAaveHistoryEvents(proxyAddress, networkId, collateralToken, debtToken)),
    from(
      services.aaveLikeReserveConfigurationData$({
        collateralToken,
        debtToken,
      }),
    ),
    from(
      services.getAaveLikeReserveData$({
        token: collateralToken,
      }),
    ),
    from(
      services.getAaveLikeReserveData$({
        token: debtToken,
      }),
    ),
  ).pipe(
    switchMap(
      ([
        primaryTokenReserveData,
        secondaryTokenReserveData,
        aggregatedData,
        reserveConfigurationData,
        collateralReserveData,
        debtReserveData,
      ]) => {
        switch (protocol) {
          case LendingProtocol.AaveV2:
            const addressesV2 = getAddresses(networkId, LendingProtocol.AaveV2)
            return views.aave.omni.v2(
              {
                proxy: proxyAddress,
                collateralToken: _collateralToken,
                debtToken: _debtToken,
                primaryTokenReserveData,
                secondaryTokenReserveData,
                cumulatives: aggregatedData.positionCumulatives,
                collateralPrice,
                debtPrice,
                reserveConfigurationData,
                reserveData: {
                  collateral: collateralReserveData,
                  debt: debtReserveData,
                },
              },
              { addresses: addressesV2, provider },
            )
          case LendingProtocol.AaveV3:
            const addressesV3 = getAddresses(networkId, LendingProtocol.AaveV3)
            return views.aave.omni.v3(
              {
                proxy: proxyAddress,
                collateralToken: _collateralToken,
                debtToken: _debtToken,
                primaryTokenReserveData,
                secondaryTokenReserveData,
                cumulatives: aggregatedData.positionCumulatives,
                collateralPrice,
                debtPrice,
                reserveConfigurationData,
                reserveData: {
                  collateral: collateralReserveData,
                  debt: debtReserveData,
                },
              },
              { addresses: addressesV3, provider },
            )
          case LendingProtocol.SparkV3:
            const addressesSpark = getAddresses(networkId, LendingProtocol.SparkV3)
            return views.sparkOmni(
              {
                proxy: proxyAddress,
                collateralToken: _collateralToken,
                debtToken: _debtToken,
                primaryTokenReserveData,
                secondaryTokenReserveData,
                cumulatives: aggregatedData.positionCumulatives,
                collateralPrice,
                debtPrice,
                reserveConfigurationData,
                reserveData: {
                  collateral: collateralReserveData,
                  debt: debtReserveData,
                },
              },
              { addresses: addressesSpark, provider },
            )
          default:
            throw new Error('Protocol not supported')
        }
      },
    ),
  )
}

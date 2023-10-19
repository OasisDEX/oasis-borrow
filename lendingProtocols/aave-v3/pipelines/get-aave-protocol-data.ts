import type { IPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { AaveV3ConfigurationData } from 'blockchain/aave-v3'
import type { AaveLikeProtocolData, AaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

export type AaveOracleAssetPriceDataType = ({ token }: { token: string }) => Observable<BigNumber>

export type AaveUserConfigurationType = ({
  address,
}: {
  address: string
}) => Observable<AaveV3ConfigurationData>

export function getAaveProtocolData$(
  reserveData$: (args: { token: string }) => Observable<AaveLikeReserveData>,
  aaveOnChainPosition$: (params: {
    collateralToken: string
    debtToken: string
    proxyAddress: string
  }) => Observable<IPosition>,
  collateralToken: string,
  debtToken: string,
  proxyAddress: string,
): Observable<AaveLikeProtocolData> {
  return combineLatest(
    aaveOnChainPosition$({
      collateralToken,
      debtToken,
      proxyAddress,
    }),
    reserveData$({ token: collateralToken }),
    reserveData$({ token: debtToken }),
  ).pipe(
    map(([onChainPosition, collateralReserveData, debtReserveData]) => {
      return {
        position: onChainPosition,
        reserveData: {
          collateral: collateralReserveData,
          debt: debtReserveData,
        },
      }
    }),
    distinctUntilChanged((a, b) => isEqual(a, b)),
  )
}

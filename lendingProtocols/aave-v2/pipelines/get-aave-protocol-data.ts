import type { IPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { AaveV2ConfigurationData } from 'blockchain/aave/aaveV2LendingPool'
import type { AaveV2ReserveConfigurationData } from 'blockchain/aave/aaveV2ProtocolDataProvider'
import type { AaveLikeProtocolData, AaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

import type { GetAaveV2OnChainPosition } from './aave-get-on-chain-position'

export type AaveOracleAssetPriceDataType = ({ token }: { token: string }) => Observable<BigNumber>

export type AaveUserConfigurationType = ({
  address,
}: {
  address: string
}) => Observable<AaveV2ConfigurationData>

export type AaveReserveConfigurationDataType = ({
  token,
}: {
  token: string
}) => Observable<AaveV2ReserveConfigurationData>

export function getAaveProtocolData$(
  aaveReserveData$: (args: { token: string }) => Observable<AaveLikeReserveData>,
  aaveOnChainPosition$: (params: GetAaveV2OnChainPosition) => Observable<IPosition>,
  collateralToken: string,
  debtToken: string,
  proxyAddress: string,
): Observable<AaveLikeProtocolData> {
  return combineLatest(
    aaveOnChainPosition$({ collateralToken, debtToken, proxyAddress }),
    aaveReserveData$({ token: collateralToken }),
    aaveReserveData$({ token: debtToken }),
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

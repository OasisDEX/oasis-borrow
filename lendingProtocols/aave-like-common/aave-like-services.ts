import type BigNumber from 'bignumber.js'
import type { LendingProtocol } from 'lendingProtocols/LendingProtocol'
import type { Observable } from 'rxjs'
import type { LiquidationCallEvent as AaveV2LiquidationCallEvent } from 'types/ethers-contracts/AaveV2LendingPool'
import type { LiquidationCallEvent as AaveV3LiquidationCallEvent } from 'types/ethers-contracts/AaveV3Pool'
import type { LiquidationCallEvent as SparkV3LiquidationCallEvent } from 'types/ethers-contracts/SparkV3Pool'

import type { AaveLikeProtocolData } from './aave-like-protocol-data'
import type {
  AaveLikeReserveConfigurationData,
  AaveLikeReserveConfigurationDataParams,
} from './aave-like-reserve-configuration-data'
import type { AaveLikeReserveData } from './aave-like-reserve-data'
import type {
  AaveLikeUserAccountData,
  AaveLikeUserAccountDataArgs,
} from './aave-like-user-account-data'
import type { AaveLikeUserConfigurationResults } from './aave-like-user-configuration'

export interface AaveLikeServices {
  aaveLikeProtocolData$: (
    collateralToken: string,
    debtToken: string,
    proxyAddress: string,
  ) => Observable<AaveLikeProtocolData>
  protocol: LendingProtocol
  aaveLikeReserveConfigurationData$: (
    args: AaveLikeReserveConfigurationDataParams,
  ) => Observable<AaveLikeReserveConfigurationData>
  getAaveLikeReserveData$: (args: { token: string }) => Observable<AaveLikeReserveData>
  getAaveLikeAssetsPrices$: (args: { tokens: string[] }) => Observable<BigNumber[]>
  aaveLikeAvailableLiquidityInUSDC$: (args: { token: string }) => Observable<BigNumber>
  aaveLikeLiquidations$: (args: {
    proxyAddress: string
  }) => Observable<
    (AaveV2LiquidationCallEvent | AaveV3LiquidationCallEvent | SparkV3LiquidationCallEvent)[]
  >
  aaveLikeUserAccountData$: (
    args: AaveLikeUserAccountDataArgs,
  ) => Observable<AaveLikeUserAccountData>
  aaveLikeProxyConfiguration$: (
    proxyAddress: string,
  ) => Observable<AaveLikeUserConfigurationResults>
  aaveLikeOracleAssetPriceData$: (args: {
    token: string
    amount?: BigNumber
  }) => Observable<BigNumber>
}

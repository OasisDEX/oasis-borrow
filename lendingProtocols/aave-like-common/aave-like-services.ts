import BigNumber from 'bignumber.js'
import { AaveLikeProtocolData } from 'lendingProtocols/aave-like-common/aave-like-protocol-data'
import {
  AaveLikeReserveConfigurationData,
  AaveLikeReserveConfigurationDataParams,
} from 'lendingProtocols/aave-like-common/aave-like-reserve-configuration-data'
import { AaveLikeReserveData } from 'lendingProtocols/aave-like-common/aave-like-reserve-data'
import { AaveLikeUserAccountData, AaveLikeUserAccountDataArgs } from 'lendingProtocols/aave-like-common/aave-like-user-account-data'
import { AaveLikeUserConfigurationResults } from 'lendingProtocols/aave-like-common/aave-like-user-configuration'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'
import { Observable } from 'rxjs'
import { LiquidationCallEvent as AaveV2LiquidationCallEvent } from 'types/ethers-contracts/AaveV2LendingPool'
import { LiquidationCallEvent as AaveV3LiquidationCallEvent } from 'types/ethers-contracts/AaveV3Pool'
import { LiquidationCallEvent as SparkV3LiquidationCallEvent } from 'types/ethers-contracts/SparkV3Pool'

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

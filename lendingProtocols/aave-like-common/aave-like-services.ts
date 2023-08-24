import BigNumber from 'bignumber.js'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'
import { Observable } from 'rxjs'
import { LiquidationCallEvent } from 'types/ethers-contracts/AaveV2LendingPool'

import { AaveLikeProtocolData } from './aave-like-protocol-data'
import {
  AaveLikeReserveConfigurationData,
  AaveReserveConfigurationDataParams,
} from './aave-like-reserve-configuration-data'
import { AaveLikeReserveData } from './aave-like-reserve-data'
import { AaveLikeUserAccountData, AaveLikeUserAccountDataArgs } from './aave-like-user-account-data'
import { AaveLikeUserConfigurationResults } from './aave-like-user-configuration'

export interface AaveLikeServices {
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    proxyAddress: string,
  ) => Observable<AaveLikeProtocolData>
  protocol: LendingProtocol
  aaveReserveConfigurationData$: (
    args: AaveReserveConfigurationDataParams,
  ) => Observable<AaveLikeReserveConfigurationData>
  getAaveReserveData$: (args: { token: string }) => Observable<AaveLikeReserveData>
  getAaveAssetsPrices$: (args: { tokens: string[] }) => Observable<BigNumber[]>
  aaveAvailableLiquidityInUSDC$: (args: { token: string }) => Observable<BigNumber>
  aaveLiquidations$: (args: { proxyAddress: string }) => Observable<LiquidationCallEvent[]>
  aaveUserAccountData$: (args: AaveLikeUserAccountDataArgs) => Observable<AaveLikeUserAccountData>
  aaveProxyConfiguration$: (proxyAddress: string) => Observable<AaveLikeUserConfigurationResults>
  aaveOracleAssetPriceData$: (args: { token: string; amount?: BigNumber }) => Observable<BigNumber>
}

import BigNumber from 'bignumber.js'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'
import { Observable } from 'rxjs'
import { LiquidationCallEvent } from 'types/ethers-contracts/AaveV2LendingPool'

import { ProtocolData } from './protocolData'
import { ReserveConfigurationData } from './reserveConfigurationData'
import { ReserveData } from './reserveData'
import { UserAccountData, UserAccountDataArgs } from './userAccountData'
import { UserConfigurationResults } from './userConfiguration'

export interface AaveServices {
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    proxyAddress: string,
  ) => Observable<ProtocolData>
  protocol: LendingProtocol
  aaveReserveConfigurationData$: (args: { token: string }) => Observable<ReserveConfigurationData>
  getAaveReserveData$: (args: { token: string }) => Observable<ReserveData>
  getAaveAssetsPrices$: (args: { tokens: string[] }) => Observable<BigNumber[]>
  aaveAvailableLiquidityInUSDC$: (args: { token: string }) => Observable<BigNumber>
  aaveLiquidations$: (proxyAddress: string) => Observable<LiquidationCallEvent[]>
  aaveUserAccountData$: (args: UserAccountDataArgs) => Observable<UserAccountData>
  aaveProxyConfiguration$: (proxyAddress: string) => Observable<UserConfigurationResults>
  convertToAaveOracleAssetPrice$: (args: {
    token: string
    amount: BigNumber
  }) => Observable<BigNumber>
  aaveOracleAssetPriceData$: (args: { token: string }) => Observable<BigNumber>
}

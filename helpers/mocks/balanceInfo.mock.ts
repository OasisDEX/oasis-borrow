import { BigNumber } from 'bignumber.js'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { zero } from 'helpers/zero'
import { Observable, of } from 'rxjs'

export interface MockBalanceInfoProps {
  _balance$?: Observable<BalanceInfo>
  collateralBalance?: BigNumber
  ethBalance?: BigNumber
  daiBalance?: BigNumber
  address?: string | undefined
}

const defaultCollateralBalance = new BigNumber('300')
const defaultEthBalance = new BigNumber('20')
const defaultDaiBalance = new BigNumber('1000')

export function mockBalanceInfo$({
  _balance$,
  collateralBalance = defaultCollateralBalance,
  ethBalance = defaultEthBalance,
  daiBalance = defaultDaiBalance,
  address = '0xVaultController',
}: MockBalanceInfoProps): Observable<BalanceInfo> {
  return (
    _balance$ ||
    of({
      collateralBalance: address ? collateralBalance : zero,
      ethBalance: address ? ethBalance : zero,
      daiBalance: address ? daiBalance : zero,
    })
  )
}

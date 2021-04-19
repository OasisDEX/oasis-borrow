import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { IlkData } from 'blockchain/ilks'
import { Context, protoContextConnected } from 'blockchain/network'
import { ilkToToken$, protoTxHelpers } from 'components/AppContext'
import { createOpenVault$ } from 'features/openVault/openVault'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { Observable, of } from 'rxjs'
import { mockBalanceInfo$, MockBalanceInfoProps } from './balanceInfo'
import { mockIlkData$, MockIlkDataProps } from './ilks'
import { mockPriceInfo$, MockPriceInfoProps } from './priceInfo'

export interface MockOpenVaultProps {
  _context$?: Observable<Context>
  _ilkData$?: Observable<IlkData>
  _priceInfo$?: Observable<PriceInfo>
  _balanceInfo$?: Observable<BalanceInfo>
  _proxyAddress$?: Observable<string | undefined>
  _allowance$?: Observable<BigNumber>
  _ilks$?: Observable<string[]>

  ilkData?: MockIlkDataProps
  priceInfo?: MockPriceInfoProps
  balanceInfo?: MockBalanceInfoProps
  proxyAddress?: string
  allowance?: BigNumber
  account?: string
  status?: 'connected'
  ilks?: string[]
  ilk?: string
}

export function mockOpenVault$({
  _ilkData$,
  _priceInfo$,
  _balanceInfo$,
  _proxyAddress$,
  _allowance$,
  _ilks$,
  ilkData,
  priceInfo,
  balanceInfo,
  proxyAddress,
  allowance = maxUint256,
  account = '0xVaultController',
  ilks,
  ilk = 'WBTC-A',
}: MockOpenVaultProps = {}) {
  const token = ilk.split('-')[0]

  const context$ = of({
    ...protoContextConnected,
    account,
  })
  const txHelpers$ = of(protoTxHelpers)

  const priceInfo$ = () => _priceInfo$ || mockPriceInfo$({ ...priceInfo, token })
  const ilkData$ = () =>
    _ilkData$ ||
    mockIlkData$({
      ilk,
      _priceInfo$: priceInfo$(),
      ...ilkData,
    })

  const ilks$ = _ilks$ || (ilks && ilks.length ? of(ilks!) : of([ilk]))

  const balanceInfo$ = () => _balanceInfo$ || mockBalanceInfo$({ ...balanceInfo, address: account })

  const proxyAddress$ = () => _proxyAddress$ || of(proxyAddress)
  const allowance$ = () => _allowance$ || of(allowance)

  return createOpenVault$(
    context$,
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilks$,
    ilkData$,
    ilkToToken$,
    ilk,
  )
}

import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { ilkToToken$, protoTxHelpers, TxHelpers } from 'components/AppContext'
import { OpenVaultState } from 'features/openVault/openVault'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { Observable, of } from 'rxjs'

import { mockBalanceInfo$, MockBalanceInfoProps } from './balanceInfo.mock'
import { mockContextConnected$ } from './context.mock'
import { mockIlkData$, MockIlkDataProps } from './ilks.mock'
import { mockPriceInfo$, MockPriceInfoProps } from './priceInfo.mock'

var proxyquire = require('proxyquire')

const mixpanelStub = {
  track: () => true,
}

const { createOpenVault$ } = proxyquire('features/openVault/openVault', {
  'analytics/analytics': proxyquire('analytics/analytics', { 'mixpanel-browser': mixpanelStub }),
})

export interface MockOpenVaultProps {
  _context$?: Observable<ContextConnected>
  _txHelpers$?: Observable<TxHelpers>
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
  _context$,
  _txHelpers$,
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
}: MockOpenVaultProps = {}): Observable<OpenVaultState> {
  const token = ilk.split('-')[0]

  const context$ =
    _context$ ||
    mockContextConnected$({
      account,
      status: 'connected',
    })

  const txHelpers$ = _txHelpers$ || of(protoTxHelpers)

  function priceInfo$() {
    return _priceInfo$ || mockPriceInfo$({ ...priceInfo, token })
  }

  function ilkData$() {
    return (
      _ilkData$ ||
      mockIlkData$({
        ilk,
        _priceInfo$: priceInfo$(),
        ...ilkData,
      })
    )
  }

  const ilks$ = _ilks$ || (ilks && ilks.length ? of(ilks!) : of([ilk]))

  function balanceInfo$() {
    return _balanceInfo$ || mockBalanceInfo$({ ...balanceInfo, address: account })
  }

  function proxyAddress$() {
    return _proxyAddress$ || of(proxyAddress)
  }

  function allowance$() {
    return _allowance$ || of(allowance)
  }

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

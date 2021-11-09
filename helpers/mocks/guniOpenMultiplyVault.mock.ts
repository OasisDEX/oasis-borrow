import BigNumber from 'bignumber.js'
import { protoTxHelpers } from 'components/AppContext'
import { mockBalanceInfo$ } from 'helpers/mocks/balanceInfo.mock'
import { mockContextConnected } from 'helpers/mocks/context.mock'
import { mockIlkData$ } from 'helpers/mocks/ilks.mock'
import { mockPriceInfo$ } from 'helpers/mocks/priceInfo.mock'
import { of } from 'rxjs'

import { createOpenGuniVault$ } from '../../features/openGuniVault/openGuniVault'
import { mockExchangeQuote$ } from './exchangeQuote.mock'
import { MockOpenMultiplyVaultProps } from './openMultiplyVault.mock'
import { addGasEstimationMock } from './openVault.mock'

export function mockGuniOpenMultiplyVault({
  _ilkData$,
  _priceInfo$,
  _balanceInfo$,
  _proxyAddress$,
  _allowance$,
  _ilks$,
  _txHelpers$,

  ilkData,
  priceInfo,
  balanceInfo,
  proxyAddress,
  allowance = new BigNumber(0),
  account = '0xVaultController',
  ilks = ['GUNIV3DAIUSDC1-A'],
  ilk = 'GUNIV3DAIUSDC1-A',
  exchangeQuote,
}: MockOpenMultiplyVaultProps = {}) {
  const token = ilk.split('-')[0]

  const ilks$ = _ilks$ || (ilks && ilks.length ? of(ilks!) : of([ilk]))

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

  function priceInfo$() {
    return _priceInfo$ || mockPriceInfo$({ ...priceInfo, token })
  }

  function balanceInfo$() {
    return _balanceInfo$ || mockBalanceInfo$({ ...balanceInfo, address: account })
  }

  function proxyAddress$() {
    return _proxyAddress$ || of(proxyAddress)
  }

  function allowance$() {
    return _allowance$ || of(allowance)
  }

  const txHelpers$ = _txHelpers$ || of(protoTxHelpers)

  return createOpenGuniVault$(
    of(mockContextConnected),
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilks$,
    ilkData$,
    mockExchangeQuote$(exchangeQuote),
    addGasEstimationMock,
    ilk,
  )
}

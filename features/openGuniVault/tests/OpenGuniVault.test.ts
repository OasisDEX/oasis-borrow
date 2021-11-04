import { createOpenGuniVault$ } from '../openGuniVault'
import { mockContextConnected } from 'helpers/mocks/context.mock'
import { protoTxHelpers, TxHelpers } from 'components/AppContext'
import { mockPriceInfo$, MockPriceInfoProps } from 'helpers/mocks/priceInfo.mock'
import { of } from 'rxjs'
import { mockBalanceInfo$ } from 'helpers/mocks/balanceInfo.mock'
import { mockIlkData$ } from 'helpers/mocks/ilks.mock'
import BigNumber from 'bignumber.js'
import { getStateUnpacker } from 'helpers/testHelpers'

function proxyAddress$(address: string) {
  return of(undefined)
}

function allowance$(address: string) {
  return of(new BigNumber(0))
}

function ilks$() {
  return of(['GUNIV3DAIUSDC1'])
}

function ilkData$() {
  return mockIlkData$({
    ilk: 'GUNIV3DAIUSDC1',
    _priceInfo$: mockPriceInfo$(),
    liquidationRatio: new BigNumber(1.05),
  })
}

describe('test', () => {
  it.only('playground', () => {
    const openGuniVault$ = createOpenGuniVault$(
      of(mockContextConnected),
      of(protoTxHelpers),
      proxyAddress$,
      allowance$,
      (token: string) => mockPriceInfo$({ token }),
      (address?: string) => mockBalanceInfo$({ address }),
      ilks$(),
      (ilk) => ilkData$(),
      'GUNIV3DAIUSDC1',
    )

    const state = getStateUnpacker(openGuniVault$)

    console.log(state)
  })
})

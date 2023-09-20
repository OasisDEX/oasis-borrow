import BigNumber from 'bignumber.js'
import { createOpenGuniVault$ } from 'features/earn/guni/open/pipes/openGuniVault'
import { mockBalanceInfo$ } from 'helpers/mocks/balanceInfo.mock'
import { mockContextConnected } from 'helpers/mocks/context.mock'
import { mockExchangeQuote$ } from 'helpers/mocks/exchangeQuote.mock'
import { mockIlkData$ } from 'helpers/mocks/ilks.mock'
import { addGasEstimationMock } from 'helpers/mocks/openVault.mock'
import { mockPriceInfo$ } from 'helpers/mocks/priceInfo.mock'
import { slippageLimitMock } from 'helpers/mocks/slippageLimit.mock'
import { GUNI_SLIPPAGE } from 'helpers/multiply/calculations.constants'
import { protoTxHelpers } from 'helpers/protoTxHelpers'
import { getStateUnpacker } from 'helpers/testHelpers'
import { Observable, of } from 'rxjs'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function proxyAddress$(address: string) {
  return of(undefined)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const mockOnEveryBlock = new Observable<number>()

function token1Balance$() {
  return of(new BigNumber(8.549))
}

function getGuniMintAmount$() {
  return of({
    amount0: new BigNumber(58604),
    amount1: new BigNumber(12820),
    mintAmount: new BigNumber(69.96),
  })
}

describe('OpenGuniVault', () => {
  it('playground', () => {
    function gasEstimationMock$<T>(state: T) {
      return addGasEstimationMock(state)
    }

    const openGuniVault$ = createOpenGuniVault$(
      of(mockContextConnected),
      of(protoTxHelpers),
      proxyAddress$,
      allowance$,
      (token: string) => mockPriceInfo$({ token }),
      (address?: string) => mockBalanceInfo$({ address }),
      ilks$(),
      () => ilkData$(),
      mockExchangeQuote$(),
      mockOnEveryBlock,
      gasEstimationMock$,
      'GUNIV3DAIUSDC1',
      token1Balance$,
      getGuniMintAmount$,
      slippageLimitMock(),
    )

    const state = getStateUnpacker(openGuniVault$)

    console.info(state)
  })

  it('uses default GUNI slippage', () => {
    function gasEstimationMock$<T>(state: T) {
      return addGasEstimationMock(state)
    }

    const openGuniVault$ = createOpenGuniVault$(
      of(mockContextConnected),
      of(protoTxHelpers),
      proxyAddress$,
      allowance$,
      (token: string) => mockPriceInfo$({ token }),
      (address?: string) => mockBalanceInfo$({ address }),
      ilks$(),
      () => ilkData$(),
      mockExchangeQuote$(),
      mockOnEveryBlock,
      gasEstimationMock$,
      'GUNIV3DAIUSDC1',
      token1Balance$,
      getGuniMintAmount$,
      slippageLimitMock(),
    )

    const state = getStateUnpacker(openGuniVault$)()

    expect(state.slippage).toBe(GUNI_SLIPPAGE)
  })
})

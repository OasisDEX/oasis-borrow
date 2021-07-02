/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { protoTxHelpers } from 'components/AppContext'
import { ExchangeAction, Quote } from 'features/exchange/exchange'
import { mockBalanceInfo$, MockBalanceInfoProps } from 'helpers/mocks/balanceInfo.mock'
import { mockContextConnected } from 'helpers/mocks/context.mock'
import { mockIlkData$, MockIlkDataProps } from 'helpers/mocks/ilks.mock'
import { mockPriceInfo$, MockPriceInfoProps } from 'helpers/mocks/priceInfo.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { Observable, of } from 'rxjs'

import { createOpenMultiplyVault$ } from '../openMultiplyVault'

interface MockExchangeQuote {
  marketPrice?: BigNumber
}
function mockExchangeQuote$({ marketPrice = new BigNumber(2000) }: MockExchangeQuote = {}): (
  token: string,
  slippage: BigNumber,
  amount: BigNumber,
  action: ExchangeAction,
) => Observable<Quote> {
  return (token: string, _slippage: BigNumber, amount: BigNumber, _action: ExchangeAction) =>
    of({
      status: 'SUCCESS' as const,
      fromToken: {
        symbol: 'DAI',
        name: 'DAI',
        decimals: 18,
        eip2612: true,
        address: '0xDAI',
        logoURI: 'ETH',
      },
      collateralAmount: amount,
      daiAmount: marketPrice.times(amount),
      tokenPrice: marketPrice,
      toToken: {
        symbol: token,
        name: token,
        decimals: 18,
        address: `0x${token}`,
        logoURI: 'url',
      },
      toTokenAmount: 'string',
      fromTokenAmount: 'string',
      tx: {
        from: 'string',
        to: 'string',
        data: 'string',
        value: 'string',
        gasPrice: 'string',
        gas: 0,
      },
    })
}

function mockOpenMultiplyVault({
  priceInfo = {},
  balanceInfo = {},
  ilks = ['ETH-A'],
  allowance = new BigNumber(0),
  ilkData = {},
  exchangeQuote = {},
}: {
  priceInfo?: MockPriceInfoProps
  balanceInfo?: MockBalanceInfoProps
  ilks?: string[]
  allowance?: BigNumber
  ilkData?: MockIlkDataProps
  exchangeQuote?: MockExchangeQuote
} = {}) {
  return createOpenMultiplyVault$(
    of(mockContextConnected),
    of(protoTxHelpers),
    () => of('0xProxyAddress'), // Proxy
    () => of(allowance), // Allowance
    () => mockPriceInfo$(priceInfo),
    () => mockBalanceInfo$(balanceInfo),
    of(ilks),
    () => mockIlkData$(ilkData),
    mockExchangeQuote$(exchangeQuote),
    'ETH-A',
  )
}

describe('open multiply vault', () => {
  it.only('should calculate vault state for minimum possible vault', () => {
    const multiplyVault$ = mockOpenMultiplyVault({
      priceInfo: {
        collateralPrice: new BigNumber(2000),
      },
      exchangeQuote: {
        marketPrice: new BigNumber(2100),
      },
      ilkData: {
        debtFloor: new BigNumber(5000),
        liquidationRatio: new BigNumber(1.5),
      },
    })
    const state = getStateUnpacker(multiplyVault$)

    state().updateDeposit!(new BigNumber(10))
    state().updateMultiply!(new BigNumber(0))

    const stateSnap = state()

    console.log(stateSnap.afterCollateralizationRatio.toString(), 'COLL RATIO')
    console.log(stateSnap.afterOutstandingDebt.toString(), 'DEBT')
    console.log(stateSnap.buyingCollateral.toString(), 'BUYING COLLATERAL')
    console.log(stateSnap.multiply?.toString(), 'MULTIPLY')
    console.log(stateSnap.slider?.toString(), 'slider')
    console.log(stateSnap.maxPossibleCollRatio?.toString(), 'MAX POSSIBLE COLL RATIO')

    expect(stateSnap.afterCollateralizationRatio.toString()).to.eq('4.85427074695091118707')
    expect(stateSnap.multiply?.toString()).to.eq('1.25945245304603823488')
  })
})

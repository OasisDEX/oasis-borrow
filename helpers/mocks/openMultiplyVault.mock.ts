import BigNumber from 'bignumber.js'
import { protoTxHelpers } from 'components/AppContext'
import { mockBalanceInfo$, MockBalanceInfoProps } from 'helpers/mocks/balanceInfo.mock'
import { mockContextConnected } from 'helpers/mocks/context.mock'
import { mockIlkData$, MockIlkDataProps } from 'helpers/mocks/ilks.mock'
import { mockPriceInfo$, MockPriceInfoProps } from 'helpers/mocks/priceInfo.mock'
import { of } from 'rxjs'

import { createOpenMultiplyVault$ } from '../../features/openMultiplyVault/openMultiplyVault'
import { MockExchangeQuote, mockExchangeQuote$ } from './exchangeQuote.mock'

export interface MockOpenMultiplyVaultProps {
  priceInfo?: MockPriceInfoProps
  balanceInfo?: MockBalanceInfoProps
  ilks?: string[]
  allowance?: BigNumber
  ilkData?: MockIlkDataProps
  exchangeQuote?: MockExchangeQuote
}

export function mockOpenMultiplyVault({
  priceInfo = {},
  balanceInfo = {},
  ilks = ['ETH-A'],
  allowance = new BigNumber(0),
  ilkData = {},
  exchangeQuote = {},
}: MockOpenMultiplyVaultProps = {}) {
  return createOpenMultiplyVault$(
    of(mockContextConnected),
    of(protoTxHelpers),
    () => of('0xProxyAddress'),
    () => of(allowance),
    () => mockPriceInfo$(priceInfo),
    () => mockBalanceInfo$(balanceInfo),
    of(ilks),
    () => mockIlkData$(ilkData),
    mockExchangeQuote$(exchangeQuote),
    'ETH-A',
  )
}

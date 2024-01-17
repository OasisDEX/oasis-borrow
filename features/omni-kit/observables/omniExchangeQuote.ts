import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { ExchangeAction, ExchangeType } from 'features/exchange/exchange'
import { getQuote$, getTokenMetaData } from 'features/exchange/exchange'
import { omniSwapProtocolsMap, omniSwapVersionMap } from 'features/omni-kit/constants'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { from, of } from 'rxjs'
import { catchError, distinctUntilChanged, first } from 'rxjs/operators'

export function omniExchangeQuote$({
  networkId,
  quoteToken,
  collateralToken,
  exchangeType,
  amount,
  action,
  slippage,
}: {
  networkId: OmniSupportedNetworkIds
  collateralToken: string
  quoteToken: string
  slippage: BigNumber
  amount: BigNumber
  action: ExchangeAction
  exchangeType: ExchangeType
}) {
  const contracts = getNetworkContracts(networkId)
  const tokens = contracts.tokens
  const exchange = contracts[exchangeType]
  const protocols = (omniSwapProtocolsMap[networkId] ?? []).join(',')
  const swapVersion = omniSwapVersionMap[networkId]
  const quote = getTokenMetaData(quoteToken, tokens)
  const collateral = getTokenMetaData(collateralToken, tokens)

  return from(
    getQuote$(
      quote,
      collateral,
      exchange.address,
      amount,
      slippage,
      action,
      protocols,
      `/api/exchange/${swapVersion}/${networkId}/swap`,
    ),
  ).pipe(
    distinctUntilChanged((s1, s2) => {
      return JSON.stringify(s1) === JSON.stringify(s2)
    }),
    first(),
    catchError((error) => {
      console.warn('Quote error', error)
      return of(undefined)
    }),
  )
}

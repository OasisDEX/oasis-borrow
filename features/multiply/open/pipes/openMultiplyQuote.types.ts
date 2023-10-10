import type { Quote } from 'features/exchange/exchange'

type ExchangeQuoteSuccessChange = {
  kind: 'quote'
  quote: Quote
}
type ExchangeQuoteFailureChange = {
  kind: 'quoteError'
}
type ExchangeSwapSuccessChange = {
  kind: 'swap'
  swap: Quote
}
type ExchangeSwapFailureChange = {
  kind: 'swapError'
}
type ExchangeQuoteResetChange = {
  kind: 'quoteReset'
}
export type ExchangeQuoteChanges =
  | ExchangeQuoteSuccessChange
  | ExchangeQuoteFailureChange
  | ExchangeQuoteResetChange
  | ExchangeSwapSuccessChange
  | ExchangeSwapFailureChange

/*
 * Copyright (C) 2020 Maker Ecosystem Growth Holdings, INC.
 */

import { BigNumber } from 'bignumber.js'
import { ContextConnected } from 'components/blockchain/network'
import { zero } from 'helpers/zero'
import getConfig from 'next/config'
import { Dictionary } from 'ramda'
import { merge, Observable, Subject } from 'rxjs'
import { map, scan } from 'rxjs/operators'

const {
  publicRuntimeConfig: { latamexApiHost },
} = getConfig()

export enum OnrampKind {
  Wyre = 'Wyre',
  MoonPay = 'MoonPay',
  Latamex = 'Latamex',
}

export interface AmountFieldChange {
  kind: FormChangeKind.amountFieldChange
  value?: BigNumber
}

export interface CurrencyFieldChange {
  kind: FormChangeKind.currencyFieldChange
  value: string
}

export interface QuoteCurrencyFieldChange {
  kind: FormChangeKind.quoteCurrencyFieldChange
  value: string
}

export interface EmailFieldChange {
  kind: FormChangeKind.emailFieldChange
  value: string
}

export interface AccountChange {
  kind: FormChangeKind.accountChange
  account: string
}

export interface ContextChange {
  kind: FormChangeKind.contextChange
  network: string | null
}

export interface OnrampKindChange {
  kind: FormChangeKind.onrampKindChange
  onramp: OnrampKind
}

export interface RatesChange {
  kind: FormChangeKind.ratesChange
  onramp: OnrampKind
  rates: Dictionary<Quote>
}

export enum FormChangeKind {
  amountFieldChange = 'amount',
  currencyFieldChange = 'currency',
  quoteCurrencyFieldChange = 'quoteCurrency',
  emailFieldChange = 'email',
  accountChange = 'account',
  contextChange = 'context',
  onrampKindChange = 'onrampKind',
  ratesChange = 'rates',
}

export enum MessageKind {
  incorrectAmount = 'incorrectAmount',
  missingEmail = 'missingEmail',
}

export type Message = {
  kind: MessageKind
  minAmount: BigNumber
}

export type ManualChange =
  | AmountFieldChange
  | CurrencyFieldChange
  | QuoteCurrencyFieldChange
  | EmailFieldChange
  | AccountChange
  | ContextChange
  | OnrampKindChange
  | RatesChange

type OnrampFormChange = ManualChange

export type QuoteCurrency = 'USD' | 'ARS' | 'BRL' | 'MXN'

const countryCodes: Dictionary<string> = {
  ARS: 'AR',
  BRL: 'BR',
  MXN: 'MX',
}

export type Quote = {
  quote: BigNumber
  fee?: BigNumber
  minFiatAmount?: BigNumber
  minCryptoAmount?: BigNumber
}

export interface OnrampFormState {
  onramp: OnrampKind | undefined
  readyToProceed?: boolean
  token: string
  email?: string
  account?: string
  network?: string | null
  messages: Message[]
  amount?: BigNumber
  change: (change: ManualChange) => void
  proceed: (state: OnrampFormState) => void
  cancel: () => void
  rates: Dictionary<Dictionary<Quote>>
  quoteCurrency: string
}

function applyChange(state: OnrampFormState, change: OnrampFormChange): OnrampFormState {
  switch (change.kind) {
    case FormChangeKind.amountFieldChange:
      return { ...state, amount: change.value }
    case FormChangeKind.currencyFieldChange:
      return { ...state, token: change.value, amount: undefined }
    case FormChangeKind.accountChange:
      return { ...state, account: change.account }
    case FormChangeKind.contextChange:
      return { ...state, network: change.network }
    case FormChangeKind.onrampKindChange:
      const quoteCurrency: QuoteCurrency = change.onramp === OnrampKind.Latamex ? 'ARS' : 'USD'
      return { ...state, quoteCurrency, onramp: change.onramp }
    case FormChangeKind.quoteCurrencyFieldChange:
      return {
        ...state,
        quoteCurrency: change.value,
      }
    case FormChangeKind.emailFieldChange:
      return { ...state, email: change.value }
    case FormChangeKind.ratesChange:
      const rates = { ...state.rates, [change.onramp]: change.rates }

      return { ...state, rates }
  }
  return state
}

function validate(state: OnrampFormState) {
  const messages: Message[] = []
  const buyAmount = getBuyAmount(state, state.amount)

  if (state.onramp === OnrampKind.Latamex) {
    const rates = state.rates[OnrampKind.Latamex]
    if (rates) {
      const amount = rates[state.token + state.quoteCurrency].minFiatAmount?.div(
        rates[state.token + state.quoteCurrency].quote,
      )
      const minBuyAmount = amount ? new BigNumber(amount?.toFixed(4, 0)) : zero
      if (minBuyAmount && state.amount && state.amount.lt(minBuyAmount!)) {
        messages.push({
          kind: MessageKind.incorrectAmount,
          minAmount: minBuyAmount,
        })
      }
    }
  } else {
    // Minimum amount is 20 USD
    if (buyAmount && buyAmount.lt(20)) {
      messages.push({
        kind: MessageKind.incorrectAmount,
        minAmount: new BigNumber(20),
      })
    }
  }

  return {
    ...state,
    messages,
  }
}

function toAccountChange(initializedAccount$: Observable<string>) {
  return initializedAccount$.pipe(
    map((account) => {
      return {
        account,
        kind: FormChangeKind.accountChange,
      } as AccountChange
    }),
  )
}

function toContextChange(connectedContext$: Observable<ContextConnected>) {
  return connectedContext$.pipe(
    map(({ chainId }) => {
      return {
        network: chainId === 1 ? 'main' : chainId === 42 ? 'kovan' : null,
        kind: FormChangeKind.contextChange,
      } as ContextChange
    }),
  )
}

export function getBuyAmount(state: OnrampFormState, amount: BigNumber | undefined) {
  if (!state.onramp || !state.rates[state.onramp] || !amount) return undefined

  if (state.onramp === OnrampKind.Latamex) {
    const quote = state.rates[state.onramp][`${state.token}${state.quoteCurrency}`].quote

    return amount.multipliedBy(quote)
  } else {
    const quote: Quote = state.rates[state.onramp][`${state.quoteCurrency}${state.token}`]
    return amount.multipliedBy(quote.quote)
  }
}

function postForm(path: string, params: any, method: string) {
  method = method || 'post'

  const form = document.createElement('form')
  form.setAttribute('method', method)
  form.setAttribute('action', path)

  Object.keys(params).forEach((key: string) => {
    const hiddenField = document.createElement('input')
    hiddenField.setAttribute('type', 'hidden')
    hiddenField.setAttribute('name', key)
    hiddenField.setAttribute('value', params[key])

    form.appendChild(hiddenField)
  })
  document.body.appendChild(form)
  form.submit()
}

export function createOnrampForm$(
  initializedAccount$: Observable<string>,
  connectedContext$: Observable<ContextConnected>,
  wyreRates$: Observable<Dictionary<Quote>>,
  moonpayRates$: Observable<Dictionary<Quote>>,
  getLatamexRates$: Observable<Dictionary<Quote>>,
): Observable<OnrampFormState> {
  const manualChange$ = new Subject<ManualChange>()

  const change = manualChange$.next.bind(manualChange$)

  async function proceed(state: OnrampFormState) {
    const { account, network, token, amount } = state
    const redirectUrl = `${window.location.protocol}//${window.location.host}/${account}/dashboard?network=${network}`

    const failureRedirectUrl = redirectUrl

    const buyAmount = getBuyAmount(state, amount)

    if (state.onramp === OnrampKind.Wyre) {
      const result = await fetch('/api/new_wyre_order', {
        method: 'POST',
        body: JSON.stringify({
          network,
          amount: buyAmount && buyAmount.toString(),
          sourceCurrency: 'USD',
          destCurrency: token,
          recipient: account!.toLowerCase(),
          redirectUrl,
          failureRedirectUrl,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const json = await result.json()
      if (json?.url) window.location.href = json.url
    }

    if (state.onramp === OnrampKind.MoonPay) {
      window.location.href = `${window.location.protocol}//${
        window.location.host
      }/api/new_moonpay_order?recipient=${account}&currencyCode=${token.toLowerCase()}&redirectURL=${redirectUrl}&baseCurrencyCode=usd&baseCurrencyAmount=${buyAmount}&network=${network}`
    }

    if (state.onramp === OnrampKind.Latamex) {
      const { email, quoteCurrency } = state
      const quote: Quote = state.rates[OnrampKind.Latamex][`${token}${quoteCurrency}`]

      const result = await fetch('/api/new_latamex_order', {
        method: 'POST',
        body: JSON.stringify({
          email,
          feeAmount: quote.fee && quote.fee.toString(),
          originCurrency: quoteCurrency,
          country: countryCodes[quoteCurrency],
          originAmount: buyAmount && buyAmount.toString(),
          destCurrency: token,
          destAmount: amount && amount.toString(),
          recipient: account,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const encryptedPayload = await result.json()

      const payload = {
        ...encryptedPayload,
        version: 1,
        type: 'Deposit',
        consumer: 'oasis',
        countryCode: countryCodes[quoteCurrency],
        destinationAsset: token.toUpperCase(),
        originAsset: quoteCurrency,
        quote: quote && quote.quote.toString(),
        callbackUrl: redirectUrl,
      }

      const latamexUrl = `${latamexApiHost}/api/checkout/new`
      postForm(latamexUrl, payload, 'post')
    }
  }

  const initialState = {
    change,
    proceed,
    cancel: () => {},
    messages: [],
    token: 'DAI',
    account: undefined,
    network: undefined,
    rates: {},
    quoteCurrency: 'USD',
    onramp: undefined,
  }

  function toRatesChange(
    rates$: Observable<Dictionary<Quote>>,
    onramp: OnrampKind,
  ): Observable<RatesChange> {
    return rates$.pipe(
      map(
        (rates) =>
          ({
            rates,
            onramp,
            kind: FormChangeKind.ratesChange,
          } as RatesChange),
      ),
    )
  }

  return merge(
    manualChange$,
    toAccountChange(initializedAccount$),
    toContextChange(connectedContext$),
    toRatesChange(wyreRates$, OnrampKind.Wyre),
    toRatesChange(moonpayRates$, OnrampKind.MoonPay),
    toRatesChange(getLatamexRates$, OnrampKind.Latamex),
  ).pipe(scan(applyChange, initialState), map(validate))
}

/* eslint-disable func-style */
import { merge, of } from 'rxjs'
import { map } from 'rxjs/operators'

import { OpenAaveObservableService } from './openAaveStateMachine.types'

const getProxyAddress: OpenAaveObservableService = (context, _) => {
  return context.proxyAddress$.pipe(
    map((address) => ({ type: 'PROXY_ADDRESS_RECEIVED', proxyAddress: address })),
  )
}

const getBalance: OpenAaveObservableService = (context, _) => {
  return context.tokenBalances$.pipe(
    map((balances) => balances[context.token!]),
    map(({ balance, price }) => ({
      type: 'SET_BALANCE',
      balance: balance,
      tokenPrice: price,
    })),
  )
}

const createPosition: OpenAaveObservableService = (_) => {
  return of({ type: 'TRANSACTION_IN_PROGRESS', txHash: '0x0' })
}

const initMachine: OpenAaveObservableService = (context, event) => {
  return merge(getBalance(context, event), getProxyAddress(context, event))
}

export const services = { getProxyAddress, getBalance, createPosition, initMachine }

export const getNameOfService = (name: Extract<keyof typeof services, string>): string => name

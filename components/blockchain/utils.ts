import { BigNumber } from 'bignumber.js'
import padEnd from 'lodash/padEnd'
//@ts-ignore
import ethAbi from 'web3-eth-abi'

import { filter } from 'rxjs/operators'
import { RAD, RAY } from '../constants'
import { getToken } from './config'
import { Observable, OperatorFunction, pipe, UnaryFunction } from 'rxjs'

export function amountFromRay(amount: BigNumber): BigNumber {
  return amount.div(RAY)
}

export function amountFromRad(amount: BigNumber): BigNumber {
  return amount.div(RAD)
}

export function funcSigTopic(v: string): string {
  //@ts-ignore
  return padEnd(ethAbi.encodeFunctionSignature(v), 66, '0')
}

export function amountToWei(amount: BigNumber, token: string): BigNumber {
  const precision = getToken(token).precision
  return amount.times(new BigNumber(10).pow(precision as number))
}

export function filterNullish<T>(): UnaryFunction<Observable<T | null | undefined>, Observable<T>> {
  return pipe(filter((x) => x != null) as OperatorFunction<T | null | undefined, T>)
}

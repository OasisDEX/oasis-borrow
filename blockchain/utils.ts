import { BigNumber } from 'bignumber.js'
import padEnd from 'lodash/padEnd'
//@ts-ignore
import ethAbi from 'web3-eth-abi'

import { RAD, RAY } from '../components/constants'
import { getToken } from './tokensMetadata'

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
  return amount.times(new BigNumber(10).pow(precision))
}

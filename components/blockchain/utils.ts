import { BigNumber } from 'bignumber.js'
import padEnd from 'lodash/padEnd'
//@ts-ignore
import ethAbi from 'web3-eth-abi'

import { RAY } from '../constants'

export function amountFromRay(amount: BigNumber): BigNumber {
  return amount.div(RAY)
}

export function funcSigTopic(v: string): string {
  //@ts-ignore
  return padEnd(ethAbi.encodeFunctionSignature(v), 66, '0')
}

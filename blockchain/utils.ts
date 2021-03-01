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

export function storageHexToBigNumber(uint256: string): [BigNumber, BigNumber] {
  const match = uint256.match(/^0x(\w+)$/)
  if (!match) {
    throw new Error(`invalid uint256: ${uint256}`)
  }
  return match[0].length <= 32
    ? [new BigNumber(0), new BigNumber(uint256)]
    : [
        new BigNumber(`0x${match[0].substr(0, match[0].length - 32)}`),
        new BigNumber(`0x${match[0].substr(match[0].length - 32, 32)}`),
      ]
}

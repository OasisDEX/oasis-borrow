import { memoize } from 'lodash'
import type Web3 from 'web3'
export interface ContractDesc {
  abi: any
  address: string
}

const web3s: Web3[] = []
export const contract: any = memoize(
  (web3: Web3, { abi, address }: ContractDesc) => new web3.eth.Contract(abi.default, address),
  (web3: Web3, { address }: ContractDesc) => {
    if (!address) {
      throw new Error('Contract address is not defined')
    }
    if (web3s.indexOf(web3) < 0) {
      web3s[web3s.length] = web3
    }
    return `${web3s.indexOf(web3)}${address}`
  },
)

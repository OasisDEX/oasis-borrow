import { isNull, isUndefined, memoize } from 'lodash'
import Web3 from 'web3'

export const networkNameToId = {
  main: 1,
  goerli: 5,
  hardhat: 2137,
} as { [key: string]: number }

export interface ContractDesc {
  abi: any
  address: string
}

const web3s: Web3[] = []
export const contract: any = memoize(
  (web3: Web3, { abi, address }: ContractDesc) => new web3.eth.Contract(abi.default, address),
  (web3: Web3, { address }: ContractDesc) => {
    if (web3s.indexOf(web3) < 0) {
      web3s[web3s.length] = web3
    }
    return `${web3s.indexOf(web3)}${address}`
  },
)

export function getNetworkName(): string {
  const name = 'network'
  const defaultNetwork = 'main'
  const matchesIfFound = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search)
  if (isNull(matchesIfFound)) {
    return defaultNetwork
  }
  const networkName = decodeURIComponent(matchesIfFound[1].replace(/\+/g, ' '))
  if (isUndefined(networkNameToId[networkName])) {
    throw new Error(`Unsupported network in URL param: ${networkName}`)
  }
  return networkName
}

export function getNetworkId(): number {
  const networkName = getNetworkName()
  return networkNameToId[networkName]
}

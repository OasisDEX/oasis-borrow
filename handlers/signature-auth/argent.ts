import type { Abi } from 'helpers/types/Abi.types'
import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'

const walletDetectorABI: Abi[] = [
  {
    inputs: [{ internalType: 'address', name: '_wallet', type: 'address' }],
    name: 'isArgentWallet',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
]

const WALLET_DETECTOR_ADDRESS = {
  1: '0xeca4B0bDBf7c55E9b7925919d03CbF8Dc82537E8',
}

export async function checkIfArgentWallet(web3: Web3, address: string): Promise<boolean> {
  const walletDetector = new web3.eth.Contract(
    walletDetectorABI as AbiItem[],
    WALLET_DETECTOR_ADDRESS[1],
  )

  return walletDetector.methods.isArgentWallet(address).call()
}

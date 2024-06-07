import type { Abi } from 'helpers/types/Abi.types'
import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'

const eip1272CompatibleContract: Abi[] = [
  {
    inputs: [
      { internalType: 'bytes32', name: '_message', type: 'bytes32' },
      { internalType: 'bytes', name: '_signature', type: 'bytes' },
    ],
    name: 'isValidSignature',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
]
export async function isValidSignature(
  web3: Web3,
  address: string,
  message: string,
  signature: string,
): Promise<boolean> {
  const wallet = new web3.eth.Contract(eip1272CompatibleContract as AbiItem[], address)
  const messageBytes32 = web3.eth.accounts.hashMessage(message)

  try {
    await wallet.methods.isValidSignature(messageBytes32, signature).call()
    return true
  } catch (err) {
    return false
  }
}

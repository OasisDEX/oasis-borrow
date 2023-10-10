import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'

import type { ChallengeJWT } from './challenge'

export const gnosisAbi: AbiItem[] = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'isOwner',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
]

export async function checkIfGnosisOwner(
  web3: Web3,
  challenge: ChallengeJWT,
  signedAddress: string,
): Promise<boolean> {
  const gnosisProxy = new web3.eth.Contract(gnosisAbi, challenge.address)

  return await gnosisProxy.methods.isOwner(signedAddress).call()
}

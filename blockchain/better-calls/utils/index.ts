import { NetworkIds } from 'blockchain/networks'
import { ethers } from 'ethers'

export interface BaseCallParameters {
  networkId: NetworkIds
}

export interface BaseTransactionParameters extends BaseCallParameters {
  signer: ethers.Signer
}

export const GasMultiplier = 1.5

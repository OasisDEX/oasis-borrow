import BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import type { ethers } from 'ethers'

export interface BaseCallParameters {
  networkId: NetworkIds
}

export interface BaseTransactionParameters extends BaseCallParameters {
  signer: ethers.Signer
}

export const GasMultiplier = new BigNumber(1.5)

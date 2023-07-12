import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import { ethers } from 'ethers'

export interface BaseCallParameters {
  networkId: NetworkIds
}

export interface BaseTransactionParameters extends BaseCallParameters {
  signer: ethers.Signer
}

export const GasMultiplier = new BigNumber(1.5)

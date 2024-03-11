import type { Erc4626Position, SummerStrategy } from '@oasisdex/dma-library'
import { ethers } from 'ethers'

const mockResponse = {
  simulation: {
    errors: [],
    notices: [],
    position: {} as Erc4626Position ,
    targetPosition: {} as Erc4626Position ,
    successes: [],
    swaps: [],
    warnings: [],
  },
  tx: {
    to: ethers.constants.AddressZero,
    data: '',
    value: '',
  },
}

export const erc4626ActionOpenEarn = (): Promise<SummerStrategy<Erc4626Position >> => {
  return new Promise((resolve) => {
    resolve(mockResponse)
  })
}

export const erc4626ActionDepositEarn = (): Promise<SummerStrategy<Erc4626Position >> => {
  return new Promise((resolve) => {
    resolve(mockResponse)
  })
}

export const erc4626ActionWithdrawEarn = (): Promise<SummerStrategy<Erc4626Position >> => {
  return new Promise((resolve) => {
    resolve(mockResponse)
  })
}

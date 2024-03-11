import type { SummerStrategy, SupplyPosition } from '@oasisdex/dma-library'
import { ethers } from 'ethers'

const mockResponse = {
  simulation: {
    errors: [],
    notices: [],
    position: {} as SupplyPosition,
    targetPosition: {} as SupplyPosition,
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

export const erc4626ActionOpenEarn = (): Promise<SummerStrategy<SupplyPosition>> => {
  return new Promise((resolve) => {
    resolve(mockResponse)
  })
}

export const erc4626ActionDepositEarn = (): Promise<SummerStrategy<SupplyPosition>> => {
  return new Promise((resolve) => {
    resolve(mockResponse)
  })
}

export const erc4626ActionWithdrawEarn = (): Promise<SummerStrategy<SupplyPosition>> => {
  return new Promise((resolve) => {
    resolve(mockResponse)
  })
}

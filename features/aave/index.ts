/* eslint-disable @typescript-eslint/no-unused-vars */

import { ADDRESSES,strategy } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { providers } from 'ethers'

import { ContextConnected } from '../../blockchain/network'
import {  oneInchCallMock } from '../../helpers/swap'

export interface ActionCall {
  targetHash: string
  callData: string
}

export interface PositionInfo {
  flashLoanAmount: BigNumber
  borrowedAmount: BigNumber
  fee: BigNumber
  depositedAmount: BigNumber
}

export interface OpenPositionResult {
  calls: ActionCall[]
  operationName: string
  positionInfo: PositionInfo
  isAllowanceNeeded: boolean
}

interface ServiceRegistry {
  getServiceAddress(name: string): Promise<string>
}

const localAddresses: Record<string, string> = {
  ServiceRegistry: '0x7580708993de7CA120E957A62f26A5dDD4b3D8aC',
  OperationsRegistry: '0x75c68e69775fA3E9DD38eA32E554f6BF259C1135',
  OperationExecutor: '0x572316aC11CB4bc5daf6BDae68f43EA3CCE3aE0e',
  OperationStorage: '0x975Ab64F4901Af5f0C96636deA0b9de3419D0c2F',
  PullToken: '0x4593ed9CbE6003e687e5e77368534bb04b162503',
  SendToken: '0xCd7c00Ac6dc51e8dCc773971Ac9221cC582F3b1b',
  SetApproval: '0x8ac87219a0F5639BC01b470F87BA2b26356CB2B9',
  TakeFlashloan: '0x94fFA1C7330845646CE9128450F8e6c3B5e44F86',
  AaveDeposit: '0xCa1D199b6F53Af7387ac543Af8e8a34455BBe5E0',
  AaveBorrow: '0xdF46e54aAadC1d55198A4a8b4674D7a4c927097A',
  AaveWithdraw: '0xf5c4a909455C00B99A90d93b48736F3196DB5621',
}

const registry: ServiceRegistry = {
  getServiceAddress(name: string): Promise<string> {
    const addresses: Record<string, string> = Object.entries(ADDRESSES.main).reduce(
      (acc, [key, value]) => {
        return { ...acc, [key]: value }
      },
      {},
    )

    if (addresses[name]) {
      return Promise.resolve(addresses[name])
    }

    if (localAddresses[name]) {
      return Promise.resolve(localAddresses[name])
    }

    throw new Error(`ServiceRegistry: Service ${name} not found`)
  },
}

export async function getOpenAaveParameters(
  context: ContextConnected,
  amount: BigNumber,
  multiply: number,
  slippage: BigNumber,
  proxyAddress: string,
): Promise<OpenPositionResult> {
  const mainnetAddresses = {
    DAI: ADDRESSES.main.DAI,
    ETH: ADDRESSES.main.ETH,
    WETH: ADDRESSES.main.WETH,
    stETH: ADDRESSES.main.stETH,
    chainlinkEthUsdPriceFeed: ADDRESSES.main.chainlinkEthUsdPriceFeed,
    aavePriceOracle: ADDRESSES.main.aavePriceOracle,
    aaveLendingPool: ADDRESSES.main.aave.MainnetLendingPool,
    operationExecutor: context.operationExecutor.address,
  }

  const addresses = {
    ...mainnetAddresses,
  }

  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  const strategyReturn = await strategy.openStEth(
    {
      depositAmount: amount,
      slippage: slippage,
      multiply: new BigNumber(multiply),
    },
    {
      addresses,
      provider: provider,
      getSwapData: oneInchCallMock,
      dsProxy: proxyAddress,
      // getSwapData: getOneInchRealCall('0x7C8BaafA542c57fF9B2B90612bf8aB9E86e22C09'),
    },
  )

  return {
    calls: strategyReturn.calls,
    operationName: 'CustomOperation',
    positionInfo: {
      flashLoanAmount: strategyReturn.flashLoanAmount,
      borrowedAmount: strategyReturn.borrowEthAmount,
      fee: strategyReturn.feeAmount,
      depositedAmount: amount,
    },
    isAllowanceNeeded: false,
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import BigNumber from 'bignumber.js'
import { makeOperation } from 'oasis-actions'

import { zero } from '../../helpers/zero'
import { amountToWei } from '@oasisdex/utils/lib/src/utils'
import { ADDRESSES } from 'oasis-actions/src/helpers/addresses'

export interface ActionCall {
  targetHash: string
  callData: string
}

export interface PositionInfo {
  flashloanAmount: BigNumber
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
  address: string,
  amount: BigNumber,
  multiply: number,
  token: string = 'ETH',
): Promise<OpenPositionResult> {
  const flashloanAmount = amountToWei(new BigNumber(1000000))
  const depositAmount = amountToWei(new BigNumber(200000))
  const borrowAmount = amountToWei(new BigNumber(5))

  const operations = await makeOperation(registry, ADDRESSES.main)

  const calls = await operations.openStEth({
    account: address,
    depositAmount,
    flashloanAmount,
    borrowAmount,
    fee: 0,
    swapData: 0,
    receiveAtLeast: new BigNumber(1),
  })
  return {
    calls: calls,
    operationName: 'CustomOperation',
    positionInfo: {
      flashloanAmount: flashloanAmount,
      borrowedAmount: borrowAmount,
      fee: zero,
      depositedAmount: depositAmount,
    },
    isAllowanceNeeded: false,
  }
}

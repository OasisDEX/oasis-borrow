import { ActionCall } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ensureContractsExist, getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { ethers } from 'ethers'
import { AccountImplementation__factory, OperationExecutor__factory } from 'types/ethers-contracts'

export interface DpmExecuteParameters {
  networkId: NetworkIds
  proxyAddress: string
  signer: ethers.Signer
  operationName: string
  calls: ActionCall[]
  value: BigNumber
}

export async function estimateGasOnDpm({
  networkId,
  proxyAddress,
  signer,
  calls,
  operationName,
  value,
}: DpmExecuteParameters): Promise<number | undefined> {
  const dpm = AccountImplementation__factory.connect(proxyAddress, signer)
  const contracts = getNetworkContracts(networkId)
  ensureContractsExist(networkId, contracts, ['operationExecutor'])
  const { operationExecutor } = contracts

  const operationExecutorContract = OperationExecutor__factory.connect(
    operationExecutor.address,
    signer,
  )
  const encodedCallDAta = operationExecutorContract.interface.encodeFunctionData('executeOp', [
    calls,
    operationName,
  ])

  try {
    const result = await dpm.estimateGas.execute(operationExecutor.address, encodedCallDAta, {
      value: ethers.utils.parseEther(value.toString()).toHexString(),
    })
    return result.toNumber()
  } catch (e) {
    console.error(
      `Error estimating gas. Action: ${operationName} on proxy: ${proxyAddress}. Network: ${networkId}`,
      e,
    )
    return undefined
  }
}

export async function executeOnDpm({
  networkId,
  proxyAddress,
  signer,
  calls,
  operationName,
  value,
}: DpmExecuteParameters) {
  const dpm = AccountImplementation__factory.connect(proxyAddress, signer)
  const contracts = getNetworkContracts(networkId)
  ensureContractsExist(networkId, contracts, ['operationExecutor'])
  const { operationExecutor } = contracts

  const operationExecutorContract = OperationExecutor__factory.connect(
    operationExecutor.address,
    signer,
  )

  console.assert(
    operationExecutor.address === '0xFDFf46fF5752CE2A4CAbAAf5a2cFF3744E1D09de',
    'Wrong operation executor address',
  )

  const encodedCallDAta = operationExecutorContract.interface.encodeFunctionData('executeOp', [
    calls,
    operationName,
  ])

  try {
    const result = await dpm.execute(operationExecutor.address, encodedCallDAta, {
      value: ethers.utils.parseEther(value.toString()).toHexString(),
      gasLimit: ethers.BigNumber.from(1000000),
    })
    return await result.wait()
  } catch (e) {
    console.error(
      `Error executing action: ${operationName} on proxy: ${proxyAddress}. Network: ${networkId}`,
      e,
    )
    throw e
  }
}

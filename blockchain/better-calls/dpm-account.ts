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

async function validateParameters({
  signer,
  networkId,
  proxyAddress,
}: Pick<DpmExecuteParameters, 'proxyAddress' | 'signer' | 'networkId'>) {
  const signerChainId = await signer.getChainId()
  if (signerChainId !== networkId) {
    throw new Error(
      `Signer is on a different network than the one specified. Signer: ${signerChainId}. Network: ${networkId}`,
    )
  }

  const dpm = AccountImplementation__factory.connect(proxyAddress, signer)
  const contracts = getNetworkContracts(networkId)
  ensureContractsExist(networkId, contracts, ['operationExecutor'])
  const { operationExecutor } = contracts

  const operationExecutorContract = OperationExecutor__factory.connect(
    operationExecutor.address,
    signer,
  )

  return { dpm, operationExecutor: operationExecutorContract }
}

export async function estimateGasOnDpm({
  networkId,
  proxyAddress,
  signer,
  calls,
  operationName,
  value,
}: DpmExecuteParameters): Promise<number | undefined> {
  const { dpm, operationExecutor } = await validateParameters({ signer, networkId, proxyAddress })

  const encodedCallDAta = operationExecutor.interface.encodeFunctionData('executeOp', [
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

export async function createExecuteTransaction({
  networkId,
  proxyAddress,
  signer,
  calls,
  operationName,
  value,
}: DpmExecuteParameters): Promise<ethers.ContractTransaction> {
  const { dpm, operationExecutor } = await validateParameters({ signer, networkId, proxyAddress })
  const encodedCallDAta = operationExecutor.interface.encodeFunctionData('executeOp', [
    calls,
    operationName,
  ])

  return await dpm.execute(operationExecutor.address, encodedCallDAta, {
    value: ethers.utils.parseEther(value.toString()).toHexString(),
    gasLimit: ethers.BigNumber.from(10000000),
  })
}

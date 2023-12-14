import type { ActionCall } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ensureContractsExist, getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { networkSetById } from 'blockchain/networks'
import { ethers } from 'ethers'
import { AccountImplementation__factory, OperationExecutor__factory } from 'types/ethers-contracts'

import { isDangerTransactionEnabled } from './is-danger-transaction-enabled'
import { GasMultiplier } from './utils'
import { getOverrides } from './utils/get-overrides'
import type { EstimatedGasResult } from './utils/types'

export interface DpmExecuteOperationExecutorActionParameters {
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
}: Pick<DpmExecuteOperationExecutorActionParameters, 'proxyAddress' | 'signer' | 'networkId'>) {
  const signerChainId = await signer.getChainId()
  if (signerChainId !== networkId) {
    const signerNetworkConfig = networkSetById[signerChainId]
    if (
      signerNetworkConfig?.isCustomFork &&
      networkId === signerNetworkConfig.getParentNetwork()?.id
    ) {
      console.info(`Using custom fork for the transaction. Network: ${networkId}`)
    } else {
      throw new Error(
        `Signer is on a different network than the one specified. Signer: ${signerChainId}. Network: ${networkId}`,
      )
    }
  }

  const dpm = AccountImplementation__factory.connect(proxyAddress, signer)

  const dpmOwner = await dpm.owner()
  const signerAddress = await signer.getAddress()
  if (dpmOwner !== signerAddress) {
    throw new Error(
      `Signer is not the owner of the proxy. Signer: ${signerAddress}. Owner: ${dpmOwner}`,
    )
  }
  const contracts = getNetworkContracts(networkId)
  ensureContractsExist(networkId, contracts, ['operationExecutor'])
  const { operationExecutor } = contracts

  const operationExecutorContract = OperationExecutor__factory.connect(
    operationExecutor.address,
    signer,
  )

  return { dpm, operationExecutor: operationExecutorContract }
}

export async function estimateGasOnDpmForOperationExecutorAction({
  networkId,
  proxyAddress,
  signer,
  calls,
  operationName,
  value,
}: DpmExecuteOperationExecutorActionParameters): Promise<EstimatedGasResult | undefined> {
  const { dpm, operationExecutor } = await validateParameters({ signer, networkId, proxyAddress })

  const encodedCallDAta = operationExecutor.interface.encodeFunctionData('executeOp', [
    calls,
    operationName,
  ])

  try {
    const transactionData = dpm.interface.encodeFunctionData('execute', [
      operationExecutor.address,
      encodedCallDAta,
    ])

    const result = await dpm.estimateGas.execute(operationExecutor.address, encodedCallDAta, {
      ...(await getOverrides(signer)),
      value: ethers.utils.parseEther(value.toString()).toHexString(),
    })

    return {
      estimatedGas: new BigNumber(result.toString()).multipliedBy(GasMultiplier).toFixed(0),
      transactionData,
    }
  } catch (e) {
    const message = `Error estimating gas. Action: ${operationName} on proxy: ${proxyAddress}. Network: ${networkId}`
    console.error(message, e)
    throw new Error(message, {
      cause: e,
    })
  }
}

export async function createExecuteOperationExecutorTransaction({
  networkId,
  proxyAddress,
  signer,
  calls,
  operationName,
  value,
}: DpmExecuteOperationExecutorActionParameters): Promise<ethers.ContractTransaction> {
  const { dpm, operationExecutor } = await validateParameters({ signer, networkId, proxyAddress })

  const encodedCallDAta = operationExecutor.interface.encodeFunctionData('executeOp', [
    calls,
    operationName,
  ])

  const dangerTransactionEnabled = isDangerTransactionEnabled()

  if (dangerTransactionEnabled.enabled) {
    console.warn(
      `Danger transaction enabled. Gas limit: ${dangerTransactionEnabled.gasLimit}. Operation name: ${operationName}`,
      calls,
    )
    return await dpm.execute(operationExecutor.address, encodedCallDAta, {
      ...(await getOverrides(signer)),
      value: ethers.utils.parseEther(value.toString()).toHexString(),
      gasLimit: ethers.BigNumber.from(dangerTransactionEnabled.gasLimit),
    })
  }
  const gasLimit = await estimateGasOnDpmForOperationExecutorAction({
    networkId,
    proxyAddress,
    signer,
    operationName,
    value,
    calls,
  })
  return await dpm.execute(operationExecutor.address, encodedCallDAta, {
    ...(await getOverrides(signer)),
    value: ethers.utils.parseEther(value.toString()).toHexString(),
    gasLimit: gasLimit?.estimatedGas ?? undefined,
  })
}

export interface DpmOperationParams {
  networkId: NetworkIds
  proxyAddress: string
  signer: ethers.Signer
  value?: BigNumber
  data: string
  to: string
}

export async function estimateGas({
  signer,
  networkId,
  proxyAddress,
  data,
  value,
  to,
}: DpmOperationParams) {
  const { dpm } = await validateParameters({ signer, networkId, proxyAddress })

  try {
    const result = await dpm.estimateGas.execute(to, data, {
      ...(await getOverrides(signer)),
      value: ethers.utils.parseEther(value?.toString() ?? '0').toHexString(),
    })

    return new BigNumber(result.toString()).multipliedBy(GasMultiplier).toFixed(0)
  } catch (e) {
    const message = `Error estimating gas. Action: ${data} on proxy: ${proxyAddress}. Network: ${networkId}`
    console.error(message, e)
    throw new Error(message, {
      cause: e,
    })
  }
}

export async function executeTransaction({
  signer,
  networkId,
  proxyAddress,
  data,
  value,
  to,
}: DpmOperationParams) {
  const { dpm } = await validateParameters({ signer, networkId, proxyAddress })

  const dangerTransactionEnabled = isDangerTransactionEnabled()

  if (dangerTransactionEnabled.enabled) {
    console.warn(`Danger transaction enabled. Gas limit: ${dangerTransactionEnabled.gasLimit}`)

    return await dpm.execute(to, data, {
      ...(await getOverrides(signer)),
      value: ethers.utils.parseEther(value?.toString() ?? '0').toHexString(),
      gasLimit: ethers.BigNumber.from(dangerTransactionEnabled.gasLimit),
    })
  }
  const gasLimit = await estimateGas({
    networkId,
    proxyAddress,
    signer,
    value,
    to,
    data,
  })
  return await dpm.execute(to, data, {
    ...(await getOverrides(signer)),
    value: ethers.utils.parseEther(value?.toString() ?? '0').toHexString(),
    gasLimit: gasLimit ?? undefined,
  })
}

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

export interface DpmExecuteParameters {
  networkId: NetworkIds
  proxyAddress: string
  signer: ethers.Signer
  operationName: string
  calls: ActionCall[]
  value: BigNumber
}

export async function validateParameters({
  signer,
  networkId,
  proxyAddress,
}: Pick<DpmExecuteParameters, 'proxyAddress' | 'signer' | 'networkId'>) {
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
}: DpmExecuteParameters): Promise<EstimatedGasResult | undefined> {
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
  const gasLimit = await estimateGasOnDpm({
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

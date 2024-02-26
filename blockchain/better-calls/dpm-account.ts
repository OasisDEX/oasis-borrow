import type { ActionCall, Tx } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ensureContractsExist, getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { networkSetById } from 'blockchain/networks'
import { ethers } from 'ethers'
import type { OperationExecutor } from 'types/ethers-contracts'
import { AccountImplementation__factory, OperationExecutor__factory } from 'types/ethers-contracts'

import { isDangerTransactionEnabled } from './is-danger-transaction-enabled'
import { GasMultiplier } from './utils'
import { getOverrides } from './utils/get-overrides'
import type { EstimatedGasResult } from './utils/types'

export interface DpmExecuteOperationLegacyParameters {
  networkId: NetworkIds
  proxyAddress: string
  signer: ethers.Signer
  operationName: string
  calls: ActionCall[]
  value: BigNumber
}

export interface DpmExecuteOperationParameters {
  networkId: NetworkIds
  signer: ethers.Signer
  proxyAddress: string
  tx: Tx
}

export type DpmExecuteOperationExecutorActionParameters =
  | DpmExecuteOperationLegacyParameters
  | DpmExecuteOperationParameters

export async function validateParameters({
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

  let dpmOwner = ''
  try {
    dpmOwner = await dpm.owner()
  } catch (e) {
    throw new Error(
      `Error getting owner of the proxy. Proxy: ${proxyAddress}. Network: ${networkId}, error: ${e}`,
    )
  }

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

function extractTransactionData(
  params: DpmExecuteOperationExecutorActionParameters,
  operationExecutor: OperationExecutor,
): { value: BigNumber; encodedOperationExecutorData: string } {
  if ('tx' in params) {
    return {
      value: new BigNumber(params.tx.value),
      encodedOperationExecutorData: params.tx.data,
    }
  }
  return {
    value: params.value,
    encodedOperationExecutorData: operationExecutor.interface.encodeFunctionData('executeOp', [
      params.calls,
      params.operationName,
    ]),
  }
}

export async function estimateGasOnDpmForOperationExecutorAction(
  params: DpmExecuteOperationExecutorActionParameters,
): Promise<EstimatedGasResult | undefined> {
  const { dpm, operationExecutor } = await validateParameters({ ...params })

  const { value, encodedOperationExecutorData } = extractTransactionData(params, operationExecutor)

  try {
    const transactionData = dpm.interface.encodeFunctionData('execute', [
      operationExecutor.address,
      encodedOperationExecutorData,
    ])
    const result = await dpm.estimateGas.execute(
      operationExecutor.address,
      encodedOperationExecutorData,
      {
        ...(await getOverrides(params.signer)),
        value: ethers.utils.parseEther(value.toString()).toHexString(),
      },
    )

    return {
      estimatedGas: new BigNumber(result.toString()).multipliedBy(GasMultiplier).toFixed(0),
      transactionData: transactionData,
    }
  } catch (e) {
    const message = `Error estimating gas. On proxy: ${params.proxyAddress}. Network: ${params.networkId}`
    console.error(message, e)
    throw new Error(message, {
      cause: e,
    })
  }
}

export async function createExecuteOperationExecutorTransaction(
  params: DpmExecuteOperationExecutorActionParameters,
): Promise<ethers.ContractTransaction> {
  const { dpm, operationExecutor } = await validateParameters({ ...params })

  const { value, encodedOperationExecutorData } = extractTransactionData(params, operationExecutor)

  const dangerTransactionEnabled = isDangerTransactionEnabled()

  if (dangerTransactionEnabled.enabled) {
    console.warn(`Danger transaction enabled. Gas limit: ${dangerTransactionEnabled.gasLimit}`)

    return await dpm.execute(operationExecutor.address, encodedOperationExecutorData, {
      ...(await getOverrides(params.signer)),
      value: ethers.utils.parseEther(value.toString()).toHexString(),
      gasLimit: ethers.BigNumber.from(dangerTransactionEnabled.gasLimit),
    })
  }
  const gasLimit = await estimateGasOnDpmForOperationExecutorAction(params)
  return await dpm.execute(operationExecutor.address, encodedOperationExecutorData, {
    ...(await getOverrides(params.signer)),
    value: ethers.utils.parseEther(value.toString()).toHexString(),
    gasLimit: gasLimit?.estimatedGas ?? undefined,
  })
}

export interface DpmOperationParams {
  networkId: NetworkIds
  proxyAddress?: string
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
  await validateParameters({ signer, networkId, proxyAddress: proxyAddress ?? to })

  try {
    const result = await signer.estimateGas({
      ...(await getOverrides(signer)),
      to: to,
      data: data,
      value: ethers.utils.parseEther(value?.toString() ?? '0').toHexString(),
    })

    return new BigNumber(result.toString()).multipliedBy(GasMultiplier).toFixed(0)
  } catch (e) {
    const message = `Error estimating gas. Action: ${data} on proxy: ${
      proxyAddress ?? to
    }. Network: ${networkId}`
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
  await validateParameters({ signer, networkId, proxyAddress: proxyAddress ?? to })

  const dangerTransactionEnabled = isDangerTransactionEnabled()

  if (dangerTransactionEnabled.enabled) {
    console.warn(`Danger transaction enabled. Gas limit: ${dangerTransactionEnabled.gasLimit}`)

    return await signer.sendTransaction({
      ...(await getOverrides(signer)),
      to: to,
      data: data,
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
  return await signer.sendTransaction({
    ...(await getOverrides(signer)),
    to: to,
    data: data,
    value: ethers.utils.parseEther(value?.toString() ?? '0').toHexString(),
    gasLimit: gasLimit ?? undefined,
  })
}

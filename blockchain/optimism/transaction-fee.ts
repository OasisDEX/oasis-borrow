/*
 * We need to calculate the transaction fee for the L2 transaction.
 * Optimism formula is:
 *  l2_execution_fee = transaction_gas_price * l2_gas_used
 *  transaction_gas_price = l2_base_fee + l2_priority_fee
 * OP Mainnet differs from Ethereum because all transactions on OP Mainnet are also published to Ethereum. This step is crucial to the security properties of OP Mainnet because it means that all of the data you need to sync an OP Mainnet node is always publicly available on Ethereum. It's what makes OP Mainnet an L2.
 * Users on OP Mainnet have to pay for the cost of submitting their transactions to Ethereum. We call this the L1 data fee, and it's the primary discrepancy between OP Mainnet (and other L2s) and Ethereum. Because the cost of gas is so expensive on Ethereum, the L1 data fee typically dominates the total cost of a transaction on OP Mainnet. This fee is based on four factors:
 * The current gas price on Ethereum.
 * The gas cost to publish the transaction to Ethereum. This scales roughly with the size of the transaction (in bytes).
 * A fixed overhead cost denominated in gas. This is currently set to 2100.
 * A dynamic overhead cost which scales the L1 fee paid by a fixed number. This is currently set to 0.684.
 * Here's the math:
 * l1_data_fee = l1_gas_price * (tx_data_gas + fixed_overhead) * dynamic_overhead
 * tx_data_gas = count_zero_bytes(tx_data) * 4 + count_non_zero_bytes(tx_data) * 16
 */

import { EstimatedGasResult } from 'blockchain/better-calls/utils/types'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { GasPriceOracle__factory } from 'types/ethers-contracts'

// {
//   l1DataFee: string
//   l2ExecutionFee: string
// }

export interface OptimismTransactionFee {
  l2Fee: string
  l1Fee: string
}

export async function getTransactionFee(
  args: EstimatedGasResult | undefined,
): Promise<OptimismTransactionFee | undefined> {
  if (!args) {
    return undefined
  }
  const { estimatedGas, transactionData } = args
  const { gasPriceOracle } = getNetworkContracts(NetworkIds.OPTIMISMMAINNET)
  const provider = getRpcProvider(NetworkIds.OPTIMISMMAINNET)

  const gasPrice = await provider.getGasPrice()
  const l2Fee = gasPrice.mul(estimatedGas)

  const contract = GasPriceOracle__factory.connect(gasPriceOracle.address, provider)

  const l1Fee = await contract.getL1Fee(transactionData)

  return {
    l2Fee: l2Fee.toString(),
    l1Fee: l1Fee.toString(),
  }
}

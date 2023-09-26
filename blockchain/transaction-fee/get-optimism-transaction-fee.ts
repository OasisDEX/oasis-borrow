import type { EstimatedGasResult } from 'blockchain/better-calls/utils/types'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { ChainlinkPriceOracle__factory, GasPriceOracle__factory } from 'types/ethers-contracts'

export interface OptimismTransactionFee {
  l2Fee: string
  l1Fee: string
  ethUsdPrice: string
}

export async function getOptimismTransactionFee(
  args: EstimatedGasResult | undefined,
): Promise<OptimismTransactionFee | undefined> {
  if (!args) {
    return undefined
  }
  const { estimatedGas, transactionData } = args
  const { gasPriceOracle, chainlinkPriceOracle } = getNetworkContracts(NetworkIds.OPTIMISMMAINNET)
  const provider = getRpcProvider(NetworkIds.OPTIMISMMAINNET)

  const gasPrice = await provider.getGasPrice()
  const l2Fee = gasPrice.mul(estimatedGas)

  const contract = GasPriceOracle__factory.connect(gasPriceOracle.address, provider)
  const priceOracleContracty = ChainlinkPriceOracle__factory.connect(
    chainlinkPriceOracle.ETHUSD.address,
    provider,
  )

  const l1Fee = await contract.getL1Fee(transactionData)
  const ethUsdPrice = await priceOracleContracty.latestAnswer()

  return {
    l2Fee: l2Fee.toString(),
    l1Fee: l1Fee.toString(),
    ethUsdPrice: ethUsdPrice.toString(),
  }
}

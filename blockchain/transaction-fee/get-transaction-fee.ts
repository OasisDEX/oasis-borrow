import { amountFromWei } from '@oasisdex/utils'
import type { ChainlinkSupportedNetworks } from 'blockchain/calls/chainlink/chainlinkPriceOracle'
import { getChainlinkOraclePrice } from 'blockchain/calls/chainlink/chainlinkPriceOracle'
import { NetworkIds } from 'blockchain/networks'
import { getGasPrice } from 'blockchain/prices'

export interface TransactionFee {
  fee: string
  feeUsd: string
  ethUsdPrice: string
}

export async function getTransactionFee(
  args: { estimatedGas?: string; networkId?: NetworkIds } | undefined,
): Promise<TransactionFee | undefined> {
  if (!args || !args.estimatedGas) {
    return undefined
  }

  const network = [NetworkIds.GOERLI, NetworkIds.HARDHAT].includes(
    args.networkId || NetworkIds.MAINNET,
  )
    ? NetworkIds.MAINNET
    : args.networkId || NetworkIds.MAINNET
  const gasPrice = await getGasPrice(network)
  const fee = amountFromWei(gasPrice.maxFeePerGas.times(args.estimatedGas))
  const ethUsdPrice = await getChainlinkOraclePrice('ETHUSD', network as ChainlinkSupportedNetworks)

  return {
    fee: fee.toString(),
    feeUsd: fee.times(ethUsdPrice).toString(),
    ethUsdPrice: ethUsdPrice.toString(),
  }
}

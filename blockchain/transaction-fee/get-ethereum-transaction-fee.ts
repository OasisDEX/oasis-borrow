import { amountFromWei } from '@oasisdex/utils'
import { getChainlinkOraclePrice } from 'blockchain/calls/chainlink/chainlinkPriceOracle'
import { NetworkIds } from 'blockchain/networks'
import { getGasPrice } from 'blockchain/prices'

export interface EthereumTransactionFee {
  fee: string
  feeUsd: string
  ethUsdPrice: string
}

export async function getEthereumTransactionFee(
  args: { estimatedGas: string } | undefined,
): Promise<EthereumTransactionFee | undefined> {
  if (!args) {
    return undefined
  }

  const gasPrice = await getGasPrice()

  const fee = amountFromWei(gasPrice.maxFeePerGas.times(args.estimatedGas))

  const ethUsdPrice = await getChainlinkOraclePrice('ETHUSD', NetworkIds.MAINNET)

  return {
    fee: fee.toString(),
    feeUsd: fee.times(ethUsdPrice).toString(),
    ethUsdPrice: ethUsdPrice.toString(),
  }
}

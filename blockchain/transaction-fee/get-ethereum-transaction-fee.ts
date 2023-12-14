import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { getGasPrice } from 'blockchain/prices'
import { ChainlinkPriceOracle__factory } from 'types/ethers-contracts'

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
  const { chainlinkPriceOracle } = getNetworkContracts(NetworkIds.MAINNET)
  const provider = getRpcProvider(NetworkIds.MAINNET)

  const gasPrice = await getGasPrice()

  const fee = gasPrice.maxFeePerGas.multipliedBy(args.estimatedGas)

  const priceOracleContract = ChainlinkPriceOracle__factory.connect(
    chainlinkPriceOracle.ETHUSD.address,
    provider,
  )

  const ethUsdPrice = await priceOracleContract
    .latestAnswer()
    .then((res) => new BigNumber(res.toString()))

  return {
    fee: fee.toString(),
    feeUsd: fee.dividedBy(ethUsdPrice).toString(),
    ethUsdPrice: ethUsdPrice.toString(),
  }
}

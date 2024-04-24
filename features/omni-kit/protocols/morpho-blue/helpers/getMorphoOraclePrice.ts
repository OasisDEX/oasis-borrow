import BigNumber from 'bignumber.js'
import { getRpcProvider } from 'blockchain/networks'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { ChainlinkPairOracle__factory as ChainlinkPairOracleFactory } from 'types/ethers-contracts'

interface GetMorphoOraclePriceParams {
  collateralPrecision: number
  networkId: OmniSupportedNetworkIds
  oracle: string
  quotePrecision: number
}

export async function getMorphoOraclePrice({
  collateralPrecision,
  networkId,
  oracle,
  quotePrecision,
}: GetMorphoOraclePriceParams) {
  const rpcProvider = getRpcProvider(networkId)

  const ChainlinkPairOracleContract = ChainlinkPairOracleFactory.connect(oracle, rpcProvider)
  const price = await ChainlinkPairOracleContract.price()

  return new BigNumber(price.toString()).div(
    new BigNumber(10).pow(36 + quotePrecision - collateralPrecision),
  )
}

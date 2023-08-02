import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider,NetworkIds } from 'blockchain/networks'
import { PriceServiceResponse } from 'helpers/types'
import { SdaiPriceOracle__factory } from 'types/ethers-contracts'

const SdaiPriceOracleFactory = SdaiPriceOracle__factory

export async function getSDaiOracleTicker(): Promise<PriceServiceResponse> {
  const rpcProvider = getRpcProvider(NetworkIds.MAINNET)
  const SdaiPriceOracleContractAddress = getNetworkContracts(NetworkIds.MAINNET).SdaiOracle.address
  const SdaiPriceOracleContract = SdaiPriceOracleFactory.connect(
    SdaiPriceOracleContractAddress,
    rpcProvider,
  )

  const response = await SdaiPriceOracleContract.latestAnswer()
  const sdai = new BigNumber(response.toString()).div(new BigNumber(10 ** 8)).toNumber()

  return {
    sdai,
  }
}

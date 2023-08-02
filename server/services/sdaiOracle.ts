import BigNumber from 'bignumber.js'
import { getRpcProvider } from 'blockchain/networks'
import { PriceServiceResponse } from 'helpers/types'
import { SdaiPriceOracle__factory } from 'types/ethers-contracts'

const SdaiPriceOracleFactory = SdaiPriceOracle__factory

export async function getSDaiOracleTicker(): Promise<PriceServiceResponse> {
  const rpcProvider = getRpcProvider(1)
  const SdaiPriceOracleContractAddress = '0xb9E6DBFa4De19CCed908BcbFe1d015190678AB5f'
  const SdaiPriceOracleContract = SdaiPriceOracleFactory.connect(
    SdaiPriceOracleContractAddress,
    rpcProvider,
  )

  const response = await SdaiPriceOracleContract.latestAnswer()
  const sdai = new BigNumber(response.toString()).div(new BigNumber(10 ** 8)).toString()

  return {
    sdai,
  }
}

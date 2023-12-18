import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { CHAIN_LINK_PRECISION } from 'components/constants'
import type { PriceServiceResponse } from 'helpers/types'
import { SdaiPriceOracle__factory as SdaiPriceOracleFactory } from 'types/ethers-contracts'

export async function getSDaiOracleTicker(): Promise<PriceServiceResponse> {
  const rpcProvider = getRpcProvider(NetworkIds.MAINNET)
  const sdaiPriceOracleContractAddress = getNetworkContracts(NetworkIds.MAINNET).SdaiOracle.address
  const sdaiPriceOracleContract = SdaiPriceOracleFactory.connect(
    sdaiPriceOracleContractAddress,
    rpcProvider,
  )

  const response = await sdaiPriceOracleContract.latestAnswer()
  const sdai = new BigNumber(response.toString())
    .div(new BigNumber(CHAIN_LINK_PRECISION))
    .toNumber()

  return {
    sdai,
  }
}

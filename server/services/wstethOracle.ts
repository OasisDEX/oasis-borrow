import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { CHAIN_LINK_PRECISION } from 'components/constants'
import type { PriceServiceResponse } from 'helpers/types'
import { WstethPriceOracle__factory as WSTETHPriceOracleFactory } from 'types/ethers-contracts'

export async function getWSTETHOracleTicker(): Promise<PriceServiceResponse> {
  const WSTETHPriceOracleContract = WSTETHPriceOracleFactory.connect(
    getNetworkContracts(NetworkIds.MAINNET).WSTETHOracle.address,
    getRpcProvider(NetworkIds.MAINNET),
  )

  const response = await WSTETHPriceOracleContract.latestAnswer()
  const wsteth = new BigNumber(response.toString())
    .div(new BigNumber(CHAIN_LINK_PRECISION))
    .toNumber()

  return {
    wsteth,
  }
}

import BigNumber from 'bignumber.js'
import { getChainlinkOraclePrice } from 'blockchain/calls/chainlink/chainlinkPriceOracle'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import type { PriceServiceResponse } from 'helpers/types'
import { RswethToken__factory } from 'types/ethers-contracts'

export async function getRswETHOracleTicker(): Promise<PriceServiceResponse> {
  const rpcProvider = getRpcProvider(NetworkIds.MAINNET)
  const chainlinkETHUsdOraclePrice = await getChainlinkOraclePrice('ETHUSD', NetworkIds.MAINNET)

  const rswETHContractAddress = getNetworkContracts(NetworkIds.MAINNET).tokens['RSWETH'].address

  const rswETHContract = RswethToken__factory.connect(rswETHContractAddress, rpcProvider)

  const ethToRswETHRateRaw = await rswETHContract.getRate()
  const ethToRswETHRate = new BigNumber(ethToRswETHRateRaw.toString()).shiftedBy(
    NEGATIVE_WAD_PRECISION,
  )

  const rsweth = ethToRswETHRate.times(chainlinkETHUsdOraclePrice).toNumber()

  return { rsweth }
}

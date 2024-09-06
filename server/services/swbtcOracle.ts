import BigNumber from 'bignumber.js'
import { getChainlinkOraclePrice } from 'blockchain/calls/chainlink/chainlinkPriceOracle'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import type { PriceServiceResponse } from 'helpers/types'
import { one } from 'helpers/zero'
import { MaplePool__factory as MaplePoolFactory } from 'types/ethers-contracts'

export async function getSwBtcOracleTicker(): Promise<PriceServiceResponse> {
  const rpcProvider = getRpcProvider(NetworkIds.MAINNET)
  const chainlinkWbtcUsdOraclePrice = await getChainlinkOraclePrice('BTCUSD', NetworkIds.MAINNET)

  const swBtcContractAddress = getNetworkContracts(NetworkIds.MAINNET).tokens['SWBTC'].address

  // factory from different project but good enough for convetToAssets method
  const swBtcContract = MaplePoolFactory.connect(swBtcContractAddress, rpcProvider)

  const btcPerOneSwBtcRaw = await swBtcContract.convertToAssets(one.shiftedBy(8).toString())

  const btcPerOneSwBtc = new BigNumber(btcPerOneSwBtcRaw.toNumber()).shiftedBy(-8)

  const swbtc = btcPerOneSwBtc.times(chainlinkWbtcUsdOraclePrice).toNumber()

  return { swbtc }
}

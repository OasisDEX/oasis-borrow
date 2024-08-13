import BigNumber from 'bignumber.js'
import { getChainlinkOraclePrice } from 'blockchain/calls/chainlink/chainlinkPriceOracle'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import type { PriceServiceResponse } from 'helpers/types'
import { one } from 'helpers/zero'
import { MaplePool__factory as MaplePoolFactory } from 'types/ethers-contracts'

export async function getSyrupUsdcOracleTicker(): Promise<PriceServiceResponse> {
  const rpcProvider = getRpcProvider(NetworkIds.MAINNET)
  const chainlinkUsdcUsdOraclePrice = await getChainlinkOraclePrice('USDCUSD', NetworkIds.MAINNET)

  const syrupUSDCContractAddress = getNetworkContracts(NetworkIds.MAINNET).tokens['SYRUPUSDC']
    .address

  const sdaiPriceOracleContract = MaplePoolFactory.connect(syrupUSDCContractAddress, rpcProvider)

  const usdcPerOneSyrupUsdcRaw = await sdaiPriceOracleContract.convertToAssets(
    one.shiftedBy(6).toString(),
  )

  const usdcPerOneSyrupUsdc = new BigNumber(usdcPerOneSyrupUsdcRaw.toNumber()).shiftedBy(-6)

  const syrupusdc = usdcPerOneSyrupUsdc.times(chainlinkUsdcUsdOraclePrice).toNumber()

  return {
    syrupusdc,
  }
}

import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { MORPHO_ORACLE_PRECISION } from 'components/constants'
import type { PriceServiceResponse } from 'helpers/types'
import { UsdePriceOracle__factory } from 'types/ethers-contracts'

export async function getUSDEOracleTicker(): Promise<PriceServiceResponse> {
  const rpcProvider = getRpcProvider(NetworkIds.MAINNET)
  const usdePriceOracleContractAddress = getNetworkContracts(NetworkIds.MAINNET).USDEOracle.address
  const usdePriceOracleContract = UsdePriceOracle__factory.connect(
    usdePriceOracleContractAddress,
    rpcProvider,
  )

  const response = await usdePriceOracleContract.price()
  const usde = new BigNumber(response.toString())
    .div(new BigNumber(MORPHO_ORACLE_PRECISION))
    .toNumber()

  return {
    usde,
  }
}

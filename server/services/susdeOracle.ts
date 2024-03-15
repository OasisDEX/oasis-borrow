import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { CHAIN_LINK_PRECISION } from 'components/constants'
import type { PriceServiceResponse } from 'helpers/types'
import { SusdePriceOracle__factory } from 'types/ethers-contracts'

export async function getSUSDEOracleTicker(): Promise<PriceServiceResponse> {
  const rpcProvider = getRpcProvider(NetworkIds.MAINNET)
  const susdePriceOracleContractAddress = getNetworkContracts(NetworkIds.MAINNET).SUSDEOracle
    .address
  const susdePriceOracleContract = SusdePriceOracle__factory.connect(
    susdePriceOracleContractAddress,
    rpcProvider,
  )

  const response = await susdePriceOracleContract.price()
  const susde = new BigNumber(response.toString())
    .div(new BigNumber(CHAIN_LINK_PRECISION))
    .toNumber()

  return {
    susde,
  }
}

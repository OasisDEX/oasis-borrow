import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { CHAIN_LINK_PRECISION } from 'components/constants'
import { ethers } from 'ethers'
import { getRpcNode } from 'helpers/getRpcNode'
import type { PriceServiceResponse } from 'helpers/types'
import { SdaiPriceOracle__factory as SdaiPriceOracleFactory } from 'types/ethers-contracts'

export async function getSDaiOracleTicker(): Promise<PriceServiceResponse> {
  const node = getRpcNode(NetworkNames.ethereumMainnet)
  if (!node) {
    throw new Error('RPC provider is not available')
  }
  const rpcProvider = new ethers.providers.JsonRpcProvider(node, {
    chainId: NetworkIds.MAINNET,
    name: NetworkNames.ethereumMainnet,
  })
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

import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { CHAIN_LINK_PRECISION } from 'components/constants'
import { ethers } from 'ethers'
import { getRpcNode } from 'helpers/getRpcNode'
import type { PriceServiceResponse } from 'helpers/types'
import { ChainlinkPriceOracle__factory } from 'types/ethers-contracts'

export async function getEthBaseChainlinkTicker(): Promise<PriceServiceResponse> {
  const node = getRpcNode(NetworkNames.baseMainnet)
  if (!node) {
    throw new Error('RPC provider is not available')
  }
  const rpcProvider = new ethers.providers.JsonRpcProvider(node, {
    chainId: NetworkIds.BASEMAINNET,
    name: NetworkNames.baseMainnet,
  })
  const ethPriceOracleContractAddress = getNetworkContracts(NetworkIds.BASEMAINNET)
    .chainlinkPriceOracle.ETHUSD.address
  const ethPriceOracleContract = ChainlinkPriceOracle__factory.connect(
    ethPriceOracleContractAddress,
    rpcProvider,
  )

  const response = await ethPriceOracleContract.latestAnswer()
  const ethBaseChainlinkTicker = new BigNumber(response.toString())
    .div(new BigNumber(CHAIN_LINK_PRECISION))
    .toNumber()

  return {
    ethBaseChainlinkTicker,
  }
}

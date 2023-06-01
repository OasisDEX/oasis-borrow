import { ProductHubItems, Protocol } from '@prisma/client'
import { BaseNetworkNames, getNetworkRpcEndpoint, NetworkIds } from 'blockchain/networks'
import { ethers } from 'ethers'
import { ProductHubSupportedNetworks } from 'features/productHub/types'
import { PRODUCT_HUB_HANDLERS } from 'handlers/product-hub/update-handlers'
import { LendingProtocol } from 'lendingProtocols'
import { prisma } from 'server/prisma'

// removing the ID cause it's not needed in the frontend
export const filterTableData = ({ id, ...table }: ProductHubItems) => table

export const checkIfAllHandlersExist = (protocols: LendingProtocol[]) => {
  return protocols.filter((protocol) => !PRODUCT_HUB_HANDLERS[protocol])
}

export function getProtocolProducts(protocol: Protocol) {
  return prisma.productHubItems.findMany({
    where: {
      protocol: {
        equals: protocol,
      },
    },
  })
}

export const productHubEthersProviders: Record<
  ProductHubSupportedNetworks,
  ethers.providers.JsonRpcProvider
> = {
  [BaseNetworkNames.Ethereum]: new ethers.providers.JsonRpcProvider(
    getNetworkRpcEndpoint(NetworkIds.MAINNET, NetworkIds.MAINNET),
  ),
  [BaseNetworkNames.Arbitrum]: new ethers.providers.JsonRpcProvider(
    getNetworkRpcEndpoint(NetworkIds.ARBITRUMMAINNET, NetworkIds.ARBITRUMMAINNET),
  ),
  [BaseNetworkNames.Optimism]: new ethers.providers.JsonRpcProvider(
    getNetworkRpcEndpoint(NetworkIds.OPTIMISMMAINNET, NetworkIds.OPTIMISMMAINNET),
  ),
}

export const measureTime = true

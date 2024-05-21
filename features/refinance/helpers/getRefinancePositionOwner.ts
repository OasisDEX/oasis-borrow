import { getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { getRpcProvider } from 'blockchain/networks'
import { DssCdpManager__factory } from 'types/ethers-contracts'

// in general, it should be provided by sdk as the rest of current position data
/**
 * gets a dpm address which is a position owner
 */
export const getMakerPositionOwner = async ({
  chainId,
  positionId,
}: {
  chainId: NetworkIds
  positionId: string
}) => {
  const rpcProvider = getRpcProvider(chainId)
  const contracts = getNetworkContracts(chainId)

  if (!('dssCdpManager' in contracts)) {
    throw new Error('Wrong chainId is being used to refinance maker position')
  }
  const address = contracts.dssCdpManager.address
  const factory = DssCdpManager__factory
  const dssCdpManagerContract = factory.connect(address, rpcProvider)
  const owner = await dssCdpManagerContract.owns(positionId)
  return owner.toLowerCase()
}

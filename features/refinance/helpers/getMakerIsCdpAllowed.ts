import { getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { getRpcProvider } from 'blockchain/networks'
import { DssCdpManager__factory } from 'types/ethers-contracts'

// in general, it should be provided by sdk as the rest of current position data
/**
 * gets an address of a position owner
 */
export const getMakerIsCdpAllowed = async ({
  chainId,
  positionId,
  positionOwner,
  allowedAddress,
}: {
  chainId: NetworkIds
  positionId: string
  positionOwner: string
  allowedAddress: string
}) => {
  const rpcProvider = getRpcProvider(chainId)
  const contracts = getNetworkContracts(chainId)

  if (!('dssCdpManager' in contracts)) {
    throw new Error('Wrong chainId is being used to refinance maker position')
  }

  const address = contracts.dssCdpManager.address
  const factory = DssCdpManager__factory
  const dssCdpManagerContract = factory.connect(address, rpcProvider)
  const allowed = await dssCdpManagerContract.cdpCan(positionOwner, positionId, allowedAddress)

  return Boolean(allowed.toNumber())
}

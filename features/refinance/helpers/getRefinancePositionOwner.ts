import { getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { getRpcProvider } from 'blockchain/networks'
import { LendingProtocol } from 'lendingProtocols'
import { DssCdpManager__factory } from 'types/ethers-contracts'

// in general, it should be provided by sdk as the rest of current position data
export const getRefinancePositionOwner = async ({
  protocol,
  chainId,
  positionId,
}: {
  protocol: LendingProtocol
  chainId: NetworkIds
  positionId: string
}) => {
  switch (protocol) {
    case LendingProtocol.Maker:
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
    default:
      // It doesn't matter for now for other protocols since owner will be provided by sdk
      return '0x0000000000000000000000000000000000000000'
  }
}

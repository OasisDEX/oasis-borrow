import { ADDRESSES, AaveLikeProtocol, Common } from '@oasisdex/addresses'
import { Address, ChainId, NetworkByChainID, ProtocolId } from 'shared/domain-types'

export const createAddressService = (chainId: ChainId) => {
  const network = NetworkByChainID[chainId]
  const addresses = ADDRESSES[network]

  const getTokenContract = (token: Common): Address => {
    try {
      const val = addresses['common'][token] as Address
      if (val == null) {
        throw Error(`Token ${token}/${network} address is null`)
      }
      return val
    } catch (error) {
      console.error(error)
      throw Error(`Unexpected error in getTokenContract: ${token}/${network}`)
    }
  }

  const getProtocolContract = (protocol: ProtocolId, contract: AaveLikeProtocol): Address => {
    try {
      let val
      switch (protocol) {
        case ProtocolId.AAVE3:
          val = addresses['aave']['v3'][contract] as Address
          break

        case ProtocolId.SPARK:
          val = addresses['spark'][contract] as Address
          break

        default:
          throw Error(`Unknown Protocol on Network: ${protocol} on ${network}`)
      }
      if (val === undefined) {
        throw Error(`Protocol ${protocol} contract ${contract} addresses is null`)
      }
      return val
    } catch (error) {
      console.error(error)
      throw Error(`Unexpected error in getProtocolContract: ${protocol}/${contract} on ${network}`)
    }
  }

  return {
    getProtocolContract,
    getTokenContract,
  }
}

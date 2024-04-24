import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider } from 'blockchain/networks'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { MorphoBlue__factory as MorphoBlueFactory } from 'types/ethers-contracts'

interface getMorphoOracleAddressParams {
  marketId: string
  networkId: OmniSupportedNetworkIds
}

export async function getMorphoOracleAddress({
  marketId,
  networkId,
}: getMorphoOracleAddressParams) {
  const rpcProvider = getRpcProvider(networkId)

  const MorphoBlueContract = MorphoBlueFactory.connect(
    getNetworkContracts(networkId).morphoBlue.address,
    rpcProvider,
  )
  const { oracle } = await MorphoBlueContract.idToMarketParams(marketId)

  return oracle
}

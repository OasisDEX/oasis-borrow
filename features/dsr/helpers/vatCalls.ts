import { BigNumber } from 'bignumber.js'
import { CallDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { Vat } from 'types/web3-v1-contracts'

export const vatDai: CallDef<string, BigNumber> = {
  call: (_, { contract, chainId }) =>
    contract<Vat>(getNetworkContracts(NetworkIds.MAINNET, chainId).vat).methods.dai,
  prepareArgs: (address) => [address],
  postprocess: (result) => new BigNumber(result),
}

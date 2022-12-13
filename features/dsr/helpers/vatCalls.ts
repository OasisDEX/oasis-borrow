import { BigNumber } from 'bignumber.js'
import { CallDef } from 'blockchain/calls/callsHelpers'
import { Vat } from 'types/web3-v1-contracts/vat'

export const vatDai: CallDef<string, BigNumber> = {
  call: (_, { contract, vat }) => contract<Vat>(vat).methods.dai,
  prepareArgs: (address) => [address],
  postprocess: (result) => new BigNumber(result),
}

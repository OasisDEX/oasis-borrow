import { BigNumber } from 'bignumber.js'
import { CallDef } from 'blockchain/calls/callsHelpers'

export const vatDai: CallDef<string, BigNumber> = {
  call: (_, { contract, vat }) => contract(vat).methods.dai,
  prepareArgs: (address) => [address],
  postprocess: (result) => new BigNumber(result),
}

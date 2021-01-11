import { ContextConnected } from '@oasisdex/transactions/lib/src/callHelpersContextParametrized'
import { Observable } from 'rxjs'
import { call, CallDef } from '../../components/blockchain/calls/callsHelpers'

interface VatUrnsArgs {
  ilk: string
  urnAddress: string
}

// interface VatUrnsResult {
//   collateral: string
//   normalizedDebt: string
// }

const vatUrns: CallDef<VatUrnsArgs, any> = {
  call: ({ ilk, urnAddress }, { contract, vat }) => {
    return contract(vat).methods['urns']
  },
  prepareArgs: ({ ilk, urnAddress }) => [ilk, urnAddress],
}

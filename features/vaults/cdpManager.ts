import { ContextConnected } from '../../components/blockchain/network'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { call, CallDef } from '../../components/blockchain/calls/callsHelpers'

interface CdpManagerUrnsArgs {
  id: string
}

interface CdpManagerUrnsResult {
  urns: string
}

const cdpManagerUrns: CallDef<CdpManagerUrnsArgs, CdpManagerUrnsResult> = {
  call: ({}, { contract, cdpManager }) => {
    return contract(cdpManager).methods['urns']
  },
  prepareArgs: ({ id }) => [id],
}

export function createCdpManagerUrns$(
  connectedContext$: Observable<ContextConnected>,
  id: string,
): Observable<string[]> {
  return connectedContext$.pipe(
    switchMap((context) => {
      return call(context, cdpManagerUrns)({ id })
    }),
  )
}

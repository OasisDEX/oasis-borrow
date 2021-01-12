import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { DssCdpManager } from 'types/web3-v1-contracts/dss-cdp-manager'
import Web3 from 'web3'

import { call, CallDef } from '../../components/blockchain/calls/callsHelpers'
import { ContextConnected } from '../../components/blockchain/network'
import { filterNullish } from './utils'

interface CdpManagerUrnsArgs {
  id: string
}

type CdpManagerUrnsResult = string | undefined

const cdpManagerUrns: CallDef<CdpManagerUrnsArgs, CdpManagerUrnsResult> = {
  call: ({}, { contract, dssCdpManager }) => {
    return contract<DssCdpManager>(dssCdpManager).methods.urns
  },
  prepareArgs: ({ id }) => [id],
}

export function createCdpManagerUrns$(
  connectedContext$: Observable<ContextConnected>,
  id: string,
): Observable<string> {
  return connectedContext$.pipe(
    switchMap((context) => {
      return call(context, cdpManagerUrns)({ id })
    }),
    filterNullish(),
  )
}

interface CdpManagerIlksArgs {
  id: string
}

type CdpManagerIlksResult = string | undefined

const cdpManagerIlks: CallDef<CdpManagerIlksArgs, CdpManagerIlksResult> = {
  call: ({}, { contract, dssCdpManager }) => {
    return contract<DssCdpManager>(dssCdpManager).methods.ilks
  },
  prepareArgs: ({ id }) => [id],
  postprocess: (ilk) => (ilk ? Web3.utils.hexToUtf8(ilk) : undefined),
}

export function createCdpManagerIlks$(
  connectedContext$: Observable<ContextConnected>,
  id: string,
): Observable<string> {
  return connectedContext$.pipe(
    switchMap((context) => {
      return call(context, cdpManagerIlks)({ id })
    }),
    filterNullish(),
  )
}

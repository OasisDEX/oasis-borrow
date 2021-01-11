import { ContextConnected } from '../../components/blockchain/network'
import { EMPTY, Observable, of } from 'rxjs'
import { filter, map, mergeMap, switchMap } from 'rxjs/operators'
import { call, CallDef } from '../../components/blockchain/calls/callsHelpers'
import Web3 from 'web3'

interface CdpManagerUrnsArgs {
  id: string
}

type CdpManagerUrnsResult = string | undefined

const cdpManagerUrns: CallDef<CdpManagerUrnsArgs, CdpManagerUrnsResult> = {
  call: ({}, { contract, cdpManager }) => {
    return contract(cdpManager).methods['urns']
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
    mergeMap((address) => (address ? of(address) : EMPTY)),
  )
}

interface CdpManagerIlksArgs {
  id: string
}

type CdpManagerIlksResult = string | undefined

const cdpManagerIlks: CallDef<CdpManagerIlksArgs, CdpManagerIlksResult> = {
  call: ({}, { contract, cdpManager }) => {
    return contract(cdpManager).methods['ilks']
  },
  prepareArgs: ({ id }) => [id],
  postprocess: (ilk) => {
    return ilk ? Web3.utils.hexToUtf8(ilk) : undefined
  },
}

export function createCdpManagerIlks$(
  connectedContext$: Observable<ContextConnected>,
  id: string,
): Observable<string> {
  return connectedContext$.pipe(
    switchMap((context) => {
      return call(context, cdpManagerIlks)({ id })
    }),
    mergeMap((kind) => (kind ? of(kind) : EMPTY)),
  )
}

import { combineLatest, Observable, of, defer, forkJoin, EMPTY } from 'rxjs'
import { ContextConnected, Context, EveryBlockFunction$ } from '../../components/blockchain/network'
import { catchError, map, mergeMap, shareReplay, switchMap } from 'rxjs/operators'
import { call, CallDef } from '../../components/blockchain/calls/callsHelpers'
import { zipWith } from 'lodash'
import * as dsProxy from 'components/blockchain/abi/ds-proxy.abi.json'
import { contractDesc } from 'components/blockchain/config'
import { nullAddress } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'

export interface VaultSummary {}

interface Vault {
  id: string
  type: string // ilk
  owner: string //proxyAddress
  address: string // urnHandler
  proxyOwner: string //
  encumberedCollateral: BigNumber // ink
  encumberedDebt: BigNumber // art
  // --------
  collateralTypePrice: BigNumber
  debtValue: BigNumber
  collateralAmount: BigNumber
  collateralValue: BigNumber
  liquidationPrice: BigNumber
  daiAvailable: BigNumber
  collateralAvailableAmount: BigNumber
  collateralAvailableValue: BigNumber
  unlockedCollateral: BigNumber

  collateralizationRatio: BigNumber
  liquidationRatio: BigNumber
  liquidationPenalty: BigNumber
  annualStabilityFee: BigNumber
  debtFloor: BigNumber
  minSafeCollateralAmount: BigNumber
  collateralDebtAvailable: BigNumber
}

export const mockVault: Vault = {
  id: '500',
  type: 'ETH-A',
  owner: '0x05623eb676A8abA2d381604B630ded1A81Dc05a9',
  address: '0x882cd8B63b4b6cB5ca2Bda899f6A8c968d66643e',
  proxyOwner: '0x8A0Bfe04D175D345b5FDcD3e9Ca5d00b608Ce6A3',
  encumberedCollateral: new BigNumber('98'),
  encumberedDebt: new BigNumber('16403.419856003889170145'),
  annualStabilityFee: new BigNumber(
    '0.024999999999905956943812259791573533789860268487320672821177905084121745214484109204754426155886843',
  ),
  collateralAmount: new BigNumber('98.00'),
  collateralAvailableAmount: new BigNumber('77.72'),
  collateralAvailableValue: new BigNumber('96770.74'),
  collateralDebtAvailable: new BigNumber('110593468.87'),
  collateralTypePrice: new BigNumber('1245.05'),
  collateralValue: new BigNumber('122014.90'),
  collateralizationRatio: new BigNumber('7.25'),
  daiAvailable: new BigNumber('64513.82'),
  debtFloor: new BigNumber('500'),
  debtValue: new BigNumber('16829.44'),
  liquidationPenalty: new BigNumber('0.13'),
  liquidationPrice: new BigNumber('257.59'),
  liquidationRatio: new BigNumber('1.50'),
  minSafeCollateralAmount: new BigNumber('20.28'),
  unlockedCollateral: new BigNumber('0'),
}

export function vault$(id: string): Observable<Vault> {
  return of({ ...mockVault, id })
}

interface VaultsSummary {
  vaults: Vault[]
}

interface GetCdpsArgs {
  proxyAddress: string
  descending: boolean
}

interface GetCdpsResult {
  ids: string[]
  urns: string[]
  ilks: string[]
}

// TODO: replace with sth from web3/ethers
function bytesToString(hex: string): string {
  return Buffer.from(hex.replace(/^0x/, ''), 'hex').toString().replace(/\x00/g, '') // eslint-disable-line no-control-regex
}

const getCdps: CallDef<GetCdpsArgs, GetCdpsResult> = {
  call: ({ proxyAddress, descending }, { contract, getCdps }) => {
    console.log(proxyAddress, descending)
    return contract(getCdps).methods[`getCdps${descending ? 'Desc' : 'Asc'}`]
  },
  prepareArgs: ({ proxyAddress }, { cdpManager }) => [cdpManager.address, proxyAddress],
  // postprocess: ({ ids, urns, ilks }: GetCdpsResult): VaultSummary[] => {
  //   return zipWith(ids, ilks, (id: string, ilk: string) => ({ id, type: bytesToString(ilk) }))
  // },
}

export function getVaults$(
  connectedContext$: Observable<ContextConnected>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  vault$: (id: string) => Observable<Vault>,
  address: string,
): Observable<Vault[]> {
  return combineLatest(connectedContext$, proxyAddress$(address)).pipe(
    switchMap(([context, proxyAddress]) => {
      if (!proxyAddress) return EMPTY
      return call(context, getCdps)({ proxyAddress, descending: true })
    }),
    switchMap(({ ids }) => of(...ids)),
    forkJoin((id: string) => vault$(id)),
  )
}

export function createVaults$(
  connectedContext$: Observable<ContextConnected>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  address: string,
): Observable<VaultSummary[]> {
  return combineLatest(connectedContext$, proxyAddress$(address)).pipe(
    switchMap(([context, proxyAddress]) => {
      if (!proxyAddress) return of([])
      return call(context, getCdps)({ proxyAddress, descending: true })
    }),
  )
}

export const proxyAddress: CallDef<string, string | undefined> = {
  call: (_, { dsProxyRegistry, contract }) => contract(dsProxyRegistry).methods.proxies,
  prepareArgs: (address) => [address],
}

export function createProxyAddress$(
  connectedContext$: Observable<ContextConnected>,
  address: string,
): Observable<string | undefined> {
  return connectedContext$.pipe(
    switchMap((context) =>
      defer(() =>
        call(
          context,
          proxyAddress,
        )(address).pipe(
          mergeMap((proxyAddress: string) => {
            if (proxyAddress === nullAddress) {
              return of(undefined)
            }
            return of(proxyAddress)
          }),
        ),
      ),
    ),
    shareReplay(1),
  )
}

export const owner: CallDef<string, string | undefined> = {
  call: (dsProxyAddress, { contract }) =>
    contract(contractDesc(dsProxy, dsProxyAddress)).methods.owner,
  prepareArgs: () => [],
}

export function createProxyOwner$(
  connectedContext$: Observable<ContextConnected>,
  proxyAddress: string,
): Observable<string | undefined> {
  return connectedContext$.pipe(
    switchMap((context) =>
      defer(() =>
        call(context, owner)(proxyAddress).pipe(map((ownerAddress: string) => ownerAddress)),
      ),
    ),
    catchError(() => of(undefined)),
    shareReplay(1),
  )
}

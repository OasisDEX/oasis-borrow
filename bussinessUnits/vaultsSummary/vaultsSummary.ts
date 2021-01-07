import { combineLatest, Observable } from 'rxjs'
import { ContextConnected, Context } from '../../components/blockchain/network'
import { proxyAddress } from '../../components/dashboard/dsrPot/dsProxyCalls'
import { mapTo, switchMap } from 'rxjs/operators'
import { call, CallDef } from '../../components/blockchain/calls/callsHelpers'
import { BigNumber } from 'bignumber.js'
import { zipWith } from 'lodash'


interface VaultSummary {
  id: string,
  type: string, // ilk
}

interface Vault extends VaultSummary {
  address: string,
  owner: string
  // ...
}

interface VaultsSummary {
  vaults: Vault[]
}

interface GetCdpsArgs {
  proxyAddress: string,
  descending: boolean
}

interface GetCdpsResult {
  vaultIds: string[];
  vaultAddresses: string[];
  vaultTypes: string[]
}

// TODO: replace with sth from web3/ethers
function bytesToString(hex: string): string {
  return Buffer.from(hex.replace(/^0x/, ''), 'hex')
    .toString()
    .replace(/\x00/g, ''); // eslint-disable-line no-control-regex
}

const getCdps: CallDef<GetCdpsArgs, VaultSummary[]> = {
  call: ({ proxyAddress, descending }, { contract, getCdps}) =>
    contract(getCdps).methods[`getCdps${descending ? 'Desc' : 'Asc'}`],
  prepareArgs: ({ proxyAddress}, {cdpManager}) => [cdpManager.address, proxyAddress],
  postprocess: ({ vaultIds, vaultAddresses, vaultTypes}: any): VaultSummary[] =>
    zipWith(vaultIds, vaultTypes, (id: string, type: string) => ({ id, type }))
  ,
}

function vaultsSummary$(
  context$: Observable<Context>,
  proxyAddress$: Observable<string>,
  address: string
) Observable<VaultsSummary> {
    return combineLatest(context$, proxyAddress$).pipe(
      switchMap(([context, proxyAddress]) => {
        call(context, getCdps)({ descending: true, proxyAddress }).pipe(
          map((vaults) => ({ ... }))
        )
      })
    )
}

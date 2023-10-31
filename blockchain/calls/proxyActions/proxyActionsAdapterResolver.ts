import type { MakerVaultType } from 'blockchain/calls/vaultResolver'
import type { Observable } from 'rxjs'
import { of, throwError } from 'rxjs'

import type { ProxyActionsSmartContractAdapterInterface } from './adapters/ProxyActionsSmartContractAdapterInterface'
import { StandardDssProxyActionsContractAdapter } from './adapters/standardDssProxyActionsContractAdapter'

type Args = ResolveFromIlkArgs | ResolveFromMakerVaultTypeArgs

type ResolveFromIlkArgs = {
  ilk: string
}

type ResolveFromMakerVaultTypeArgs = {
  makerVaultType: MakerVaultType
}

export function proxyActionsAdapterResolver$(
  args: Args,
): Observable<ProxyActionsSmartContractAdapterInterface> {
  if ('makerVaultType' in args) {
    return of(StandardDssProxyActionsContractAdapter)
  }

  if ('ilk' in args) {
    return of(StandardDssProxyActionsContractAdapter)
  }

  return throwError(
    new Error(`could not instantiate proxy actions adapter from ${JSON.stringify(args)}`),
  )
}

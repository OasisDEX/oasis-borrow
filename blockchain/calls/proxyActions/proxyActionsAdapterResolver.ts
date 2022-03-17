import { Observable, of, throwError } from 'rxjs'

import { charterIlks, cropJoinIlks } from '../../config'
import { MakerVaultType } from '../vaultResolver'
import { CharteredDssProxyActionsContractAdapter } from './adapters/CharteredDssProxyActionsContractAdapter'
import { CropjoinProxyActionsContractAdapter } from './adapters/CropjoinProxyActionsSmartContractAdapter'
import { ProxyActionsSmartContractAdapterInterface } from './adapters/ProxyActionsSmartContractAdapterInterface'
import { StandardDssProxyActionsContractAdapter } from './adapters/standardDssProxyActionsContractAdapter'

type Args = ResolveFromIlkArgs | ResolveFromMakerVaultTypeArgs

type ResolveFromIlkArgs = {
  ilk: string
}

type ResolveFromMakerVaultTypeArgs = {
  makerVaultType: MakerVaultType
}

function resolveFromMakerVaultType({
  makerVaultType,
}: ResolveFromMakerVaultTypeArgs): Observable<ProxyActionsSmartContractAdapterInterface> {
  switch (makerVaultType) {
    case MakerVaultType.STANDARD:
      return of(StandardDssProxyActionsContractAdapter)
    case MakerVaultType.CROP_JOIN:
      return of(new CropjoinProxyActionsContractAdapter())
    case MakerVaultType.CHARTER:
      return of(new CharteredDssProxyActionsContractAdapter())
  }
  throw new Error(`could not create proxy action adapter for ${makerVaultType}`)
}

function resolveFromIlk({
  ilk,
}: ResolveFromIlkArgs): Observable<ProxyActionsSmartContractAdapterInterface> {
  if (cropJoinIlks.includes(ilk)) {
    return of(new CropjoinProxyActionsContractAdapter())
  }

  if (charterIlks.includes(ilk)) {
    return throwError(
      new Error(
        `can not create a proxy actions adapter from an ${ilk} ilk - adapter is not tested for opening vaults`,
      ),
    )
  }

  return of(StandardDssProxyActionsContractAdapter)
}

export function proxyActionsAdapterResolver$(
  args: Args,
): Observable<ProxyActionsSmartContractAdapterInterface> {
  if ('makerVaultType' in args) {
    return resolveFromMakerVaultType(args)
  }

  if ('ilk' in args) {
    return resolveFromIlk(args)
  }

  return throwError(
    new Error(`could not instantiate proxy actions adapter from ${JSON.stringify(args)}`),
  )
}

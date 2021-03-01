// BASE_COLLATERAL_FEE
import { amountFromWei } from '@oasisdex/utils/lib/src/utils'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { storageHexToBigNumber } from 'blockchain/utils'
import { bindNodeCallback, combineLatest, Observable } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'

import { McdOsm } from '../../types/web3-v1-contracts/mcd-osm'
import { CallDef } from './callsHelpers'

export const pipZzz: CallDef<string, BigNumber> = {
  call: (token, context) => context.contract<McdOsm>(context.mcdOsms[token]).methods.zzz,
  prepareArgs: () => [],
  postprocess: (result) => new BigNumber(result).times(1000),
}

export const pipHop: CallDef<string, BigNumber> = {
  call: (token, context) => context.contract<McdOsm>(context.mcdOsms[token]).methods.hop,
  prepareArgs: () => [],
  postprocess: (result) => new BigNumber(result).times(1000),
}

export function createTokenCurrentPrice$(
  onEveryBlock$: Observable<number>,
  context$: Observable<Context>,
  token: string,
): Observable<BigNumber> {
  const precision = getToken(token).precision
  return combineLatest(context$, onEveryBlock$).pipe(
    switchMap(([context]) =>
      bindNodeCallback(context.web3.eth.getStorageAt)(
        context.mcdOsms[token].address,
        3, // current
      ).pipe(
        map((storageData: string) =>
          amountFromWei(storageHexToBigNumber(storageData)[1], precision),
        ),
      ),
    ),
  )
}

export function createTokenNextPrice$(
  onEveryBlock$: Observable<number>,
  context$: Observable<Context>,
  token: string,
): Observable<BigNumber> {
  const precision = getToken(token).precision
  return combineLatest(context$, onEveryBlock$).pipe(
    switchMap(([context]) =>
      bindNodeCallback(context.web3.eth.getStorageAt)(
        context.mcdOsms[token].address,
        4, // next
      ).pipe(
        map((storageData: string) =>
          amountFromWei(storageHexToBigNumber(storageData)[1], precision),
        ),
      ),
    ),
  )
}

// BASE_COLLATERAL_FEE
import BigNumber from 'bignumber.js'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { McdOsm } from '../../../types/web3-v1-contracts/mcd-osm'
import { CallDef } from './callsHelpers'

export const tokenPriceLastUpdate: CallDef<string, BigNumber> = {
  call: (token, context) => context.contract<McdOsm>(context.mcdOsms[token]).methods.zzz,
  prepareArgs: (token) => [token],
  postprocess: (result) => new BigNumber(result).times(1000),
}

export const tokenPriceUpdateInterval: CallDef<string, BigNumber> = {
  call: (token, context) => context.contract<McdOsm>(context.mcdOsms[token]).methods.hop,
  prepareArgs: (token) => [token],
  postprocess: (result) => new BigNumber(result).times(1000),
}

export function tokenPriceNextUpdate(
  tokenPriceLastUpdate$: (token: string) => Observable<BigNumber>,
  tokenPriceUpdateInterval$: (token: string) => Observable<BigNumber>,
  token: string,
): Observable<Date> {
  return combineLatest(tokenPriceLastUpdate$(token), tokenPriceUpdateInterval$(token)).pipe(
    map(([lastUpdate, interval]) => new Date(lastUpdate.plus(interval).toNumber())),
  )
}

// export function readOsm(context: NetworkConfig, token: string): Observable<{ next: number | undefined }> {
//   // const slotCurrent = 3;
//   const slotNext = 4;
//   return combineLatest(bindNodeCallback(web3.eth.getStorageAt)(context.mcd.osms[token].address, slotNext)).pipe(
//     map(([nxt]: [string, string]) => {
//       const next = storageHexToBigNumber(nxt);
//       return {
//         // current: current[0].isZero() ? undefined : amountFromWei(current[1], token),
//         next: next[0].isZero() ? undefined : amountFromWei(next[1], token),
//       };
//     }),
//     startWith({}),
//   );
// }

// export const tokenPricesNextUpdates = {
//   generate: tokenList => ({
//     dependencies: tokenList.map(token => [TOKEN_PRICE_NEXT_UPDATE, token]),
//     computed: (...list) =>
//       list.reduce(
//         (acc, time, idx) => ({
//           [`${tokenList[idx]}`]: time,
//           ...acc
//         }),
//         {}
//       )
//   })
// };

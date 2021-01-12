

// BASE_COLLATERAL_FEE
import { CallDef } from '../../components/blockchain/calls/callsHelpers'
import BigNumber from 'bignumber.js'
import { McdOsm } from '../../types/web3-v1-contracts/mcd-osm'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export const tokenPriceLastUpdate: CallDef<string, BigNumber> = {
  call: (token, context) =>
    context.contract<McdOsm>(context.mcdOsms[token]).methods.zzz,
  prepareArgs: (token) => [token],
  postprocess: (result) => new BigNumber(result).times(1000)
}

export const tokenPriceUpdateInterval: CallDef<string, BigNumber> = {
  call: (token, context) =>
    context.contract<McdOsm>(context.mcdOsms[token]).methods.hop,
  prepareArgs: (token) => [token],
  postprocess: (result) => new BigNumber(result).times(1000)
}

export function tokenPriceNextUpdate(
  tokenPriceLastUpdate$: (token: string) => Observable<BigNumber>,
  tokenPriceUpdateInterval$: (token: string) => Observable<BigNumber>,
  token: string
): Observable<Date> {
  return combineLatest(tokenPriceLastUpdate$(token), tokenPriceUpdateInterval$(token)).pipe(
    map(([lastUpdate, interval]) =>
      new Date(lastUpdate.plus(interval).toNumber()))
  )
}

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

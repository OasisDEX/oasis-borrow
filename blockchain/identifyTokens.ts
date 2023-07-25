import * as erc20 from 'blockchain/abi/erc20.json'
import { Context } from 'blockchain/network'
import { SimplifiedTokenConfig } from 'blockchain/tokensMetadata'
import { combineLatest, Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { shareReplay, switchMap } from 'rxjs/operators'
import { Erc20 } from 'types/web3-v1-contracts'

interface IdentifiedTokens {
  [key: string]: SimplifiedTokenConfig
}

async function getErc20TokenData(context: Context, address: string) {
  return Promise.all([
    context.contract<Erc20>({ abi: erc20, address }).methods.decimals().call(),
    context.contract<Erc20>({ abi: erc20, address }).methods.name().call(),
    context.contract<Erc20>({ abi: erc20, address }).methods.symbol().call(),
  ]).then(([decimals, name, symbol]) => ({
    address,
    decimals,
    name,
    symbol,
  }))
}

export function identifyTokens$(
  context$: Observable<Context>,
  once$: Observable<unknown>,
  tokens: string[],
): Observable<IdentifiedTokens> {
  const query = tokens.reduce<string>(
    (total, token, i) => `${total}${i > 0 ? '&' : ''}token=${token}`,
    '?',
  )

  return combineLatest(
    ajax.getJSON<IdentifiedTokens>(`/api/token-identifier${query}`),
    context$,
    once$,
  ).pipe(
    switchMap(async ([ajaxResponse, context]) => {
      const contractResponse = (
        await Promise.all(
          tokens
            .filter((token) => !Object.keys(ajaxResponse).includes(token))
            .map((token) => getErc20TokenData(context, token)),
        )
      ).reduce<IdentifiedTokens>(
        (total, { address, decimals, name, symbol }) => ({
          ...total,
          [address]: {
            precision: parseInt(decimals, 10),
            digits: 5,
            name,
            symbol: symbol.toUpperCase(),
          },
        }),
        {},
      )

      return tokens.reduce<IdentifiedTokens>(
        (total, token) => ({
          ...total,
          ...(Object.keys(ajaxResponse).includes(token) && {
            [token]: ajaxResponse[token],
          }),
          ...(Object.keys(contractResponse).includes(token) && {
            [token]: contractResponse[token],
          }),
        }),
        {},
      )
    }),
    shareReplay(1),
  )
}

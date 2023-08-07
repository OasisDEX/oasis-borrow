import { Tokens } from '@prisma/client'
import {
  extendTokensContracts,
  getNetworkContracts,
  pruneTokensContracts,
} from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { getToken, SimplifiedTokenConfig } from 'blockchain/tokensMetadata'
import { combineLatest, from, Observable, of } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'

export interface IdentifiedTokens {
  [key: string]: SimplifiedTokenConfig
}

function reduceIdentifiedTokens(
  total: IdentifiedTokens,
  { address, name, precision, symbol }: Tokens,
) {
  return {
    ...total,
    [address.toLowerCase()]: {
      precision,
      name,
      symbol,
    },
  }
}

export const identifyTokens$ = (
  context$: Observable<Pick<Context, 'chainId'>>,
  once$: Observable<unknown>,
  tokensAddresses: string[],
): Observable<IdentifiedTokens> =>
  combineLatest(context$, once$).pipe(
    switchMap(([context]) => {
      void pruneTokensContracts()
      const contracts = getNetworkContracts(context.chainId)

      let identifiedTokens: Tokens[] = []
      let localTokensAddresses: string[] = []

      if ('tokens' in contracts) {
        const tokensContracts = contracts.tokens

        const localTokens = Object.keys(tokensContracts).filter((token) =>
          tokensAddresses.includes(tokensContracts[token].address.toLowerCase()),
        )
        localTokensAddresses = localTokens.map((token) =>
          tokensContracts[token].address.toLowerCase(),
        )

        identifiedTokens = localTokens.map((token) => ({
          name: getToken(token).name,
          symbol: getToken(token).symbol,
          precision: getToken(token).precision,
          address: tokensContracts[token].address,
          chain_id: context.chainId,
        }))

        if (tokensAddresses.length === localTokensAddresses.length)
          return of(identifiedTokens.reduce<IdentifiedTokens>(reduceIdentifiedTokens, {}))
      }

      return from(
        fetch(`/api/tokens-info`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addresses: tokensAddresses.filter(
              (address) => !localTokensAddresses.includes(address.toLowerCase()),
            ),
            chainId: context.chainId,
          }),
        }).then((resp) => resp.json()),
      ).pipe(
        map((tokens) => {
          void extendTokensContracts(tokens)

          return [...tokens, ...identifiedTokens].reduce<IdentifiedTokens>(
            reduceIdentifiedTokens,
            {},
          )
        }),
        shareReplay(1),
      )
    }),
  )

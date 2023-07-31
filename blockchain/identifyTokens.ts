import { Tokens } from '@prisma/client'
import { extendTokensContracts, getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { combineLatest, from, Observable, of } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'

export const identifyTokens$ = (
  context$: Observable<Context>,
  once$: Observable<unknown>,
  tokensAddresses: string[],
): Observable<Tokens[]> =>
  combineLatest(context$, once$).pipe(
    switchMap(([context]) => {
      const contracts = getNetworkContracts(context.chainId)

      let identifiedTokens: Tokens[] = []
      let localTokensAddresses: string[] = []

      if ('tokens' in contracts) {
        const tokensContracts = contracts.tokens

        const localTokens = Object.keys(tokensContracts).filter((token) =>
          tokensAddresses.includes(tokensContracts[token].address),
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

        if (tokensAddresses.length === localTokensAddresses.length) return of(identifiedTokens)
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

          return [...tokens, ...identifiedTokens]
        }),
        shareReplay(1),
      )
    }),
  )

import type { Tokens } from '@prisma/client'
import { extendTokensContracts, getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { getToken, getTokenGuarded } from 'blockchain/tokensMetadata'
import { uniq } from 'lodash'
import type { Observable } from 'rxjs'
import { from, of } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

import type { IdentifiedTokens } from './identifyTokens.types'

function reduceIdentifiedTokens(
  total: IdentifiedTokens,
  { address, name, precision, symbol, source }: Tokens,
) {
  return {
    ...total,
    [address.toLowerCase()]: {
      precision,
      name,
      symbol,
      source,
    },
  }
}

export const identifyTokens$ = (
  networkId: NetworkIds,
  tokensAddresses: string[],
): Observable<IdentifiedTokens> => {
  const contracts = getNetworkContracts(networkId)

  let identifiedTokens: Tokens[] = []
  let localTokensAddresses: string[] = []

  if ('tokens' in contracts) {
    const tokensContracts = contracts.tokens

    const localTokens = uniq(
      Object.keys(tokensContracts)
        .filter((token) => {
          if (tokensContracts[token] === undefined) return false

          return (
            tokensAddresses
              .map((address) => address.toLowerCase())
              .includes(tokensContracts[token].address.toLowerCase()) && getTokenGuarded(token)
          )
        })
        .map((token) => (token === 'WETH' ? 'ETH' : token)),
    )
    localTokensAddresses = localTokens.map((token) => tokensContracts[token].address.toLowerCase())

    identifiedTokens = localTokens.map((token) => ({
      name: getToken(token).name,
      symbol: getToken(token).symbol,
      precision: getToken(token).precision,
      address: tokensContracts[token].address,
      chain_id: networkId,
      source: 'local',
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
        chainId: networkId,
      }),
    }).then((resp) => resp.json()),
  ).pipe(
    map((tokens) => {
      void extendTokensContracts(tokens)

      return [...tokens, ...identifiedTokens].reduce<IdentifiedTokens>(reduceIdentifiedTokens, {})
    }),
    shareReplay(1),
  )
}

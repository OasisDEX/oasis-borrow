import { isAddress } from 'ethers/lib/utils'
import type { SearchTokensResponse } from 'features/ajna/pool-finder/types'

interface GetOraclessTokenAddressParams {
  collateralToken: string
  quoteToken: string
}

async function tokensSearch(query: string): Promise<string[]> {
  if (isAddress(query)) {
    return [query]
  } else {
    if (query.length > 2) {
      const response = (
        (await (
          await fetch(`/api/tokens-search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: [query],
            }),
          })
        ).json()) as SearchTokensResponse[]
      ).map(({ address }) => address)

      return response.length ? response : [query]
    } else return query.length ? [query] : []
  }
}

export async function getOraclessTokenAddress({
  collateralToken,
  quoteToken,
}: GetOraclessTokenAddressParams): Promise<{
  collateralToken: string[]
  quoteToken: string[]
}> {
  return {
    collateralToken: await tokensSearch(collateralToken),
    quoteToken: await tokensSearch(quoteToken),
  }
}

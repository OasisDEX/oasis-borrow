import { isAddress } from 'ethers/lib/utils'

interface GetOraclessTokenAddressParams {
  collateralToken: string
  quoteToken: string
}

async function tokensSearch(query: string): Promise<string[]> {
  if (isAddress(query)) {
    return [query]
  } else {
    if (query.length > 2) {
      const response = Object.values(
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
        ).json()) as { [key: string]: string },
      )

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

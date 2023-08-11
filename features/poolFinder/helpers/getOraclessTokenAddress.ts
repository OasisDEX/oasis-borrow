import { isAddress } from 'ethers/lib/utils'

interface GetOraclessTokenAddressParams {
  collateralToken: string
  quoteToken: string
}

interface TokenSearchResponse {
  addresses: string[]
  tokens?: TokenSearchResponse
}

async function tokensSearch(query: string): Promise<TokenSearchResponse> {
  if (isAddress(query)) {
    return {
      addresses: [query],
    }
  } else if (query.length > 2) {
    const tokens = await (
      await fetch(`/api/tokens-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: [query],
        }),
      })
    ).json()

    return {
      addresses: Object.values(tokens),
      tokens,
    }
  } else {
    return {
      addresses: [],
    }
  }
}

export async function getOraclessTokenAddress({
  collateralToken,
  quoteToken,
}: GetOraclessTokenAddressParams): Promise<{
  collateralToken: TokenSearchResponse
  quoteToken: TokenSearchResponse
}> {
  return {
    collateralToken: await tokensSearch(collateralToken),
    quoteToken: await tokensSearch(quoteToken),
  }
}

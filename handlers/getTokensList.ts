interface TokensListResponse {
  name: string
  timestamp: string
  tokens: {
    chainId: number
    address: string
    name: string
    symbol: string
    decimals: number
  }[]
}

export async function getTokensList(): Promise<TokensListResponse> {
  return (await (
    await fetch('https://tokens.coingecko.com/uniswap/all.json')
  ).json()) as TokensListResponse
}

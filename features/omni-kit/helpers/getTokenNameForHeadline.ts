export interface GetTokenNameForHeadlineParams {
  token?: string
}

const tokenHeadlineNameMap: Record<string, string> = {
  UNIV2: 'UNIV2-AJNA-WETH',
}

export function getTokenNameForHeadline({ token }: GetTokenNameForHeadlineParams) {
  if (!token) return token
  return tokenHeadlineNameMap[token] ?? token
}

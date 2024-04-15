import { mapTokenToSdkToken } from 'features/refinance/mapTokenToSdkToken'
import { TokenAmount } from 'summerfi-sdk-common'

export const replaceETHWithWETH = (tokenAmount: TokenAmount) => {
  if (tokenAmount.token.symbol === 'ETH') {
    return TokenAmount.createFrom({
      token: mapTokenToSdkToken(tokenAmount.token.chainInfo, 'WETH'),
      amount: tokenAmount.amount,
    })
  }
  return tokenAmount
}

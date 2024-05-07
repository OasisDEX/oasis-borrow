import { mapTokenToSdkToken } from 'features/refinance/mapTokenToSdkToken'
import { type ITokenAmount, TokenAmount } from 'summerfi-sdk-common'

export const replaceETHWithWETH = (tokenAmount: ITokenAmount) => {
  if (tokenAmount.token.symbol === 'ETH') {
    return TokenAmount.createFrom({
      token: mapTokenToSdkToken(tokenAmount.token.chainInfo, 'WETH'),
      amount: tokenAmount.amount,
    })
  }
  return tokenAmount
}

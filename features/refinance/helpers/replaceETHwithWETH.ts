import { mapTokenToSdkToken } from 'features/refinance/helpers/mapTokenToSdkToken'
import { type ITokenAmount, TokenAmount } from 'summerfi-sdk-common'

export const replaceETHWithWETH = (tokenAmount: ITokenAmount): ITokenAmount => {
  if (tokenAmount.token.symbol === 'ETH') {
    return TokenAmount.createFrom({
      token: mapTokenToSdkToken(tokenAmount.token.chainInfo, 'WETH'),
      amount: tokenAmount.amount,
    })
  }
  return tokenAmount
}

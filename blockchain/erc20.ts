import { amountFromWei } from '@oasisdex/utils'
import { BigNumber } from 'bignumber.js'
import { Context } from 'blockchain/network'
import { defer, from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { getToken } from './config'

export function createTokenBalance$(
  { contract, tokens }: Context,
  token: string,
  account: string,
): Observable<BigNumber> {
  return defer(() =>
    from(contract(tokens[token]).methods.balanceOf(account).call()).pipe(
      map((balance: any) => {
        return amountFromWei(new BigNumber(balance), getToken(token).precision)
      }),
    ),
  )
}

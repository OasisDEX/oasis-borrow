import { amountFromWei } from '@oasisdex/utils'
import { BigNumber } from 'bignumber.js'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { defer, from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { getNetworkContracts } from './contracts'

export function createTokenBalance$(
  { contract, chainId }: Context,
  token: string,
  account: string,
): Observable<BigNumber> {
  return defer(() =>
    from(
      // @ts-ignore
      contract(getNetworkContracts(chainId).tokens[token]).methods.balanceOf(account).call(),
    ).pipe(
      map((balance: any) => {
        return amountFromWei(new BigNumber(balance), getToken(token).precision)
      }),
    ),
  )
}

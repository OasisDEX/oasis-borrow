import { amountFromWei } from '@oasisdex/utils'
import { BigNumber } from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import type { Observable } from 'rxjs'
import { defer, from } from 'rxjs'
import { map } from 'rxjs/operators'

import { getNetworkContracts } from './contracts'
import type { Context } from './network.types'
import { NetworkIds } from './networks'

export function createTokenBalance$(
  { contract, chainId }: Context,
  token: string,
  account: string,
): Observable<BigNumber> {
  return defer(() =>
    from(
      // @ts-ignore
      contract(getNetworkContracts(NetworkIds.MAINNET, chainId).tokens[token])
        .methods.balanceOf(account)
        .call(),
    ).pipe(
      map((balance: any) => {
        return amountFromWei(new BigNumber(balance), getToken(token).precision)
      }),
    ),
  )
}

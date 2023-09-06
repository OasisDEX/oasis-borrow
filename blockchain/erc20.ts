import { amountFromWei } from '@oasisdex/utils'
import { BigNumber } from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { defer, from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

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

import { amountFromWei } from '@oasisdex/utils'
import { BigNumber } from 'bignumber.js'
import { Context } from 'components/blockchain/network'
import { bindNodeCallback, defer, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

type GetBalanceType = (account: string, callback: (err: any, r: BigNumber) => any) => any

export function createEtherBalance$({ web3 }: Context, account: string): Observable<BigNumber> {
  return defer(() => bindNodeCallback(web3.eth.getBalance as GetBalanceType)(account)).pipe(
    map((balance) => {
      return amountFromWei(new BigNumber(balance))
    }),
  )
}

import { nullAddress } from '@oasisdex/utils'
import { disapprove } from 'blockchain/calls/erc20'
import { setProxyOwner } from 'blockchain/calls/proxy'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers$ } from 'components/AppContext'
import { identity, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export function pluginDevModeHelpers(
  txHelpers$: TxHelpers$,
  context$: Observable<ContextConnected>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
) {
  ;(window as any).removeProxy = () =>
    context$
      .pipe(
        switchMap((context) =>
          proxyAddress$(context.account).pipe(
            switchMap((proxyAddress) => {
              if (!proxyAddress) {
                return of()
              }
              return txHelpers$.pipe(
                switchMap(({ sendWithGasEstimation }) => {
                  return sendWithGasEstimation(setProxyOwner, {
                    kind: TxMetaKind.setProxyOwner,
                    proxyAddress,
                    owner: nullAddress,
                  })
                }),
              )
            }),
          ),
        ),
      )
      .subscribe(identity)
  ;(window as any).disapproveToken = (token: string) =>
    context$
      .pipe(
        switchMap((context) =>
          proxyAddress$(context.account).pipe(
            switchMap((proxyAddress) => {
              if (!proxyAddress) {
                return of()
              }
              return txHelpers$.pipe(
                switchMap(({ sendWithGasEstimation }) => {
                  return sendWithGasEstimation(disapprove, {
                    kind: TxMetaKind.disapprove,
                    token,
                    spender: proxyAddress,
                  })
                }),
              )
            }),
          ),
        ),
      )
      .subscribe(identity)
  console.log('dev helpers initialized!')
}

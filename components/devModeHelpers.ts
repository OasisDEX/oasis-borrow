import { TxHelpers$ } from 'components/AppContext'
import { ContextConnected } from 'blockchain/network'
import { identity, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { TxMetaKind } from 'blockchain/calls/txMeta'
import { setProxyOwner } from 'blockchain/calls/proxy'
import { nullAddress } from '@oasisdex/utils'

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
  // ;(window as any).disapproveDai = () =>
  //   context$
  //     .pipe(
  //       switchMap((context) =>
  //         createProxyAddress$(context, context.account).pipe(
  //           switchMap((proxyAddress) => {
  //             if (!proxyAddress) {
  //               console.log('Proxy not found!')
  //               return of()
  //             }
  //             return txHelpers$.pipe(
  //               switchMap(({ sendWithGasEstimation }) => {
  //                 return sendWithGasEstimation(disapprove, {
  //                   kind: TxMetaKind.disapprove,
  //                   token: 'DAI',
  //                   spender: proxyAddress,
  //                 })
  //               }),
  //             )
  //           }),
  //         ),
  //       ),
  //     )
  //     .subscribe(identity)
  // console.log('dev helpers initialized!')
}

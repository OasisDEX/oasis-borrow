import { TxHelpers$ } from 'components/AppContext'
import { ContextConnected } from 'blockchain/network'
import getConfig from 'next/config'
import { identity, Observable, of } from 'rxjs'
import { ajax, ajaxPost } from 'rxjs/internal-compatibility'
import { catchError, map, switchMap } from 'rxjs/operators'

import { TxMetaKind } from '../blockchain/calls/txMeta'
import { setOwner } from './dashboard/dsrPot/dsProxyCalls'
import { disapprove } from './dashboard/dsrPot/erc20Calls'
import { createProxyAddress$ } from './dashboard/proxy'

const {
  publicRuntimeConfig: { apiHost },
} = getConfig()

enum orderState {
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED',
}

export function pluginDevModeHelpers(
  txHelpers$: TxHelpers$,
  context$: Observable<ContextConnected>,
) {
  ;(window as any).showOrders = () => {
    context$
      .pipe(
        switchMap((context: ContextConnected) => {
          return ajax({
            url: `${apiHost || ''}/api/order/${context.account.toLowerCase()}`,
          }).pipe(
            map((r: any) =>
              r.response.map((e: any) => ({
                id: e.id,
                status: e.status,
                amount: e.amount,
                date: new Date(e.date),
              })),
            ),
            catchError(() => of()),
          )
        }),
      )
      .subscribe((result) => {
        console.table(result)
      })
  }
  ;(window as any).changeOrder = (orderId: string, status: orderState) => {
    ajaxPost(
      `${apiHost || ''}/api/wyre`,
      {
        referenceId: 'foobar',
        accountId: 'AC_TJM7VTUR2JG',
        orderId: orderId,
        orderStatus: status,
        transferId: 'TF_G92W4N3ZGX4',
        failedReason: null,
        reservation: '',
      },
      { 'Content-Type': 'application/json' },
    ).subscribe((result) => {
      console.log('result', result)
    })
  }
  ;(window as any).removeProxy = () =>
    context$
      .pipe(
        switchMap((context) =>
          createProxyAddress$(context, context.account).pipe(
            switchMap((proxyAddress) => {
              if (!proxyAddress) {
                console.log(`Proxy of: ${proxyAddress} not found!`)
                return of()
              }
              return txHelpers$.pipe(
                switchMap(({ sendWithGasEstimation }) => {
                  return sendWithGasEstimation(setOwner, {
                    kind: TxMetaKind.setOwner,
                    proxyAddress,
                    owner: '0x0000000000000000000000000000000000000000',
                  })
                }),
              )
            }),
          ),
        ),
      )
      .subscribe(identity)
  ;(window as any).disapproveDai = () =>
    context$
      .pipe(
        switchMap((context) =>
          createProxyAddress$(context, context.account).pipe(
            switchMap((proxyAddress) => {
              if (!proxyAddress) {
                console.log('Proxy not found!')
                return of()
              }
              return txHelpers$.pipe(
                switchMap(({ sendWithGasEstimation }) => {
                  return sendWithGasEstimation(disapprove, {
                    kind: TxMetaKind.disapprove,
                    token: 'DAI',
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

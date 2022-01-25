import { nullAddress } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { setExchangePrice } from 'blockchain/calls/dummyExchange'
import { disapprove } from 'blockchain/calls/erc20'
import { setProxyOwner } from 'blockchain/calls/proxy'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers$ } from 'components/AppContext'
import { createExchangeQuote$ } from 'features/exchange/exchange'
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
  ;(window as any).updatePrice = () =>
    context$
      .pipe(
        switchMap(() =>
          createExchangeQuote$(
            context$,
            undefined,
            'ETH',
            new BigNumber(0.05),
            new BigNumber(1),
            'BUY_COLLATERAL',
            'defaultExchange',
          ),
        ),
        switchMap((quote) => {
          if (quote.status !== 'SUCCESS') {
            return of()
          }
          return txHelpers$.pipe(
            switchMap(({ send }) => {
              return send(
                setExchangePrice as any,
                { price: new BigNumber(quote.tokenPrice) } as any,
              )
            }),
          )
        }),
      )
      .subscribe(identity)
  console.log('dev helpers initialized!')
}

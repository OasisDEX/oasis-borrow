import BigNumber from 'bignumber.js'
import getConfig from 'next/config'
import { Observable, of } from 'rxjs'
import { ajax } from 'rxjs/internal-compatibility'
import { catchError, map } from 'rxjs/operators'

const {
  publicRuntimeConfig: { apiHost },
} = getConfig()

export type OnrampOrder = {
  id: string
  type: 'wyre' | 'moonpay' | 'latamex'
  amount: BigNumber
  date: Date
  token: string
}

export type WyreOrder = OnrampOrder & {
  type: 'wyre'
  status: 'pending' | 'complete' | 'failed'
}

export type MoonpayOrder = OnrampOrder & {
  type: 'moonpay'
  status: 'pending' | 'complete' | 'failed'
}

export type LatamexOrder = OnrampOrder & {
  type: 'latamex'
  status:
    | 'initialized' // appended to our db, before propagating order to Latamex
    | 'pending' // order propagated to Latamex, viewable on their endpoint
    | 'completed' // order completed
    | 'accepted' // order accepted
    | 'rejected' // issue with the bank transfer
    | 'expired' // order in pending state > 7 days
    | 'incomplete' // order went into their db but was not completed
}

export function createOnrampOrders$(address: string): Observable<OnrampOrder[]> {
  return ajax({
    url: `${apiHost || ''}/api/order/${address.toLowerCase()}`,
  }).pipe(
    map((r: any) =>
      r.response.map((e: any) => ({
        ...e,
        amount: new BigNumber(e.amount),
        date: new Date(e.date),
      })),
    ),
    catchError(() => of()),
  )
}

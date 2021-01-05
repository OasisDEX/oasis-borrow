import { BigNumber } from 'bignumber.js'
import getConfig from 'next/config'
import { Dictionary } from 'ramda'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { map } from 'rxjs/operators'

const {
  publicRuntimeConfig: { graphApiHost },
} = getConfig()

export function getAaveApy$(): Observable<any> {
  return ajax({
    url: `https://${graphApiHost}/subgraphs/name/aave/protocol-multy-raw`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      query: `{ reserves (where: {name: "Dai Stablecoin"})  { id name price {id} liquidityRate}}
`,
      variables: {},
    },
  }).pipe(
    map((r: any) => {
      const response: Dictionary<any> = r.response
      const reserve = response.data.reserves
      return new BigNumber(reserve[0].liquidityRate).div('1e27').times(100)
    }),
  )
}

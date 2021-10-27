import { IlkDataList } from 'blockchain/ilks'
import { groupBy } from 'lodash'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export type IlksPerToken = Record<string, IlkDataList>

const aggregationPatterns: Record<string, RegExp> = {
  'UNI LP Tokens': /^(GUNIV3|UNIV2)/,
}

export function aggregateTokensByPattern(token: string) {
  return Object.keys(aggregationPatterns).find((key) => aggregationPatterns[key].test(token))
}

export function createIlksPerToken$(
  ilkDataList$: Observable<IlkDataList>,
): Observable<IlksPerToken> {
  return ilkDataList$.pipe(
    map((ilkDataList) => {
      return groupBy(ilkDataList, (ilkDataList) => {
        const aggregatedTokenKey = aggregateTokensByPattern(ilkDataList.token)
        if (aggregatedTokenKey) {
          return aggregatedTokenKey
        }
        return ilkDataList.token
      })
    }),
  )
}

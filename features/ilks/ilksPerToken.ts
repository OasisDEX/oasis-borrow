import { IlkDataList } from 'blockchain/ilks'
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
      return ilkDataList.reduce((acc, curr) => {
        const aggregatedTokenKey = aggregateTokensByPattern(curr.token)

        if (aggregatedTokenKey && acc[aggregatedTokenKey]) {
          return {
            ...acc,
            [aggregatedTokenKey]: [...acc[aggregatedTokenKey], curr],
          }
        }
        if (aggregatedTokenKey) {
          return { ...acc, [aggregatedTokenKey]: [curr] }
        }
        if (acc[curr.token]) {
          return {
            ...acc,
            [curr.token]: [...acc[curr.token], curr],
          }
        }
        return { ...acc, [curr.token]: [curr] }
      }, {} as IlksPerToken)
    }),
  )
}

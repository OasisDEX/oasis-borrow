import { IlkDataList } from 'blockchain/ilks'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export type IlksPerToken = Record<string, IlkDataList>

const patterns: Record<string, RegExp> = {
  'UNI LP Tokens': /^(GUNIV3|UNIV2)/,
}

export function groupTokensByPattern(token: string) {
  return Object.keys(patterns).find((key) => patterns[key].test(token))
}

export function createIlksPerToken$(
  ilkDataList$: Observable<IlkDataList>,
): Observable<IlksPerToken> {
  return ilkDataList$.pipe(
    map((ilkDataList) => {
      // has metadata check missing
      return ilkDataList.reduce((acc, curr) => {
        const checkForPatt = groupTokensByPattern(curr.token)
        if (checkForPatt && acc[checkForPatt]) {
          return {
            ...acc,
            [checkForPatt]: [...acc[checkForPatt], curr],
          }
        }
        if (checkForPatt) {
          return { ...acc, [checkForPatt]: [curr] }
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

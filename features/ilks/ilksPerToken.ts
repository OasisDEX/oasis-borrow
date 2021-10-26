import { IlkDataList } from 'blockchain/ilks'
import { zero } from 'helpers/zero'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export type IlksPerToken = Record<string, IlkDataList>

export function createIlksPerToken$(
  ilkDataList$: Observable<IlkDataList>,
): Observable<IlksPerToken> {
  return ilkDataList$.pipe(
    map((ilkDataList) => {
      const filteredIlks = ilkDataList.filter(({ ilkDebtAvailable }) => ilkDebtAvailable.gt(zero))
      return filteredIlks.reduce((acc, curr) => {
        if (acc[curr.token]) {
          return { ...acc, [curr.token]: [...acc[curr.token], curr] }
        }
        return { ...acc, [curr.token]: [curr] }
      }, {} as Record<string, IlkDataList>)
    }),
  )
}

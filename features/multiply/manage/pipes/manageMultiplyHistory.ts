import { BigNumber } from 'bignumber.js'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { VaultHistoryEvent } from '../../../vaultHistory/vaultHistory'

export function createMultiplyHistoryChange$(
  vaultMultiplyHistory$: (id: BigNumber) => Observable<VaultHistoryEvent[]>,
  id: BigNumber,
) {
  return vaultMultiplyHistory$(id).pipe(
    map((vaultHistory) => ({
      kind: 'vaultHistory',
      vaultHistory,
    })),
  )
}

import type {
  MigrateAaveContext,
  MigrateAaveEvent,
} from 'features/aave/manage/state/migrateAaveStateMachine'
import type { BaseAaveContext, BaseAaveEvent } from 'features/aave/types'
import type { AaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

export function xstateReserveDataService(
  reserveData: (args: { token: string }) => Observable<AaveLikeReserveData>,
): (context: BaseAaveContext) => Observable<BaseAaveEvent> {
  return (context) => {
    return combineLatest(
      reserveData({ token: context.tokens.debt }),
      reserveData({ token: context.tokens.collateral }),
    ).pipe(
      map(([debt, collateral]) => ({
        type: 'UPDATE_RESERVE_DATA',
        reserveData: {
          debt,
          collateral,
        },
      })),
    )
  }
}

export function xstateReserveDataServiceForMigration(
  reserveData: (args: { token: string }) => Observable<AaveLikeReserveData>,
): (context: MigrateAaveContext) => Observable<MigrateAaveEvent> {
  return (context) => {
    return combineLatest(
      reserveData({ token: context.strategyConfig.tokens.debt }),
      reserveData({ token: context.strategyConfig.tokens.collateral }),
    ).pipe(
      map(([debt, collateral]) => ({
        type: 'UPDATE_RESERVE_DATA',
        reserveData: {
          debt,
          collateral,
        },
      })),
    )
  }
}

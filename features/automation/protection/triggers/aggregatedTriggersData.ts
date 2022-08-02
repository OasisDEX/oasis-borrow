// TODO async function loadTriggerDataFromCache ?

export interface AggregatedTriggerRecord {
  groupId: number
  groupTypeId: 1
  triggerIds: number[]
}

export interface AggregtedTriggersData {
  // isAutomationEnabled: boolean // TODO will we need it here ?
  triggers?: AggregatedTriggerRecord[]
}

// TODO ŁW it makes no sense without cache
// export function createAggregatedTriggersData(
//     context$: Observable<Context>,
//     onEveryBlock$: Observable<number>,
//     vault$: (id: BigNumber) => Observable<Vault>,
//     id: BigNumber,
//   ): Observable<AggregtedTriggersData> {
//     return every5Seconds$.pipe(
//         withLatestFrom(context$, vault$(id))
//         mergeMap(([, , vault]) => {
//           const networkConfig = networksById[vault.chainId]
//           return  {}
//         }),
//         distinctUntilChanged((s1, s2) => {
//           return JSON.stringify(s1) === JSON.stringify(s2)
//         }),
//         shareReplay(1),
//       )
//   }

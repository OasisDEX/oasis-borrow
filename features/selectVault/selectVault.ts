import { OpenVaultState } from 'features/openVault/openVault'
import { Observable, of, Subject } from 'rxjs'
import { map, scan, shareReplay, startWith, switchMap } from 'rxjs/operators'

type VaultType = 'borrow' | 'leverage'

interface SelectBorrow {
  vaultType: 'borrow'
  state: OpenVaultState
  setVaultType: (type: VaultType) => void
}

interface SelectLeverage {
  vaultType: 'leverage'
  state: OpenVaultState
  setVaultType: (type: VaultType) => void
}

interface NotSelectedState {
  vaultType: undefined
  state: undefined
  setVaultType: (type: VaultType) => void
}

type SelectVaultTypeState = NotSelectedState | SelectBorrow | SelectLeverage
type PartialState = Omit<SelectVaultTypeState, 'state'>

interface TypeChange {
  kind: 'vaultType'
  vaultType: VaultType
}

type Changes = TypeChange

function apply(state: PartialState, change: Changes): PartialState {
  switch (change.kind) {
    case 'vaultType':
      return {
        ...state,
        vaultType: change.vaultType,
      }
    default:
      return state
  }
}

export function createSelectVault$(
  openVault$: (ilk: string) => Observable<OpenVaultState>,
  openLeverageVault$: (ilk: string) => Observable<OpenVaultState>,
  ilk: string,
) {
  const change$ = new Subject<Changes>()

  function setVaultType(vaultType: VaultType) {
    change$.next({
      kind: 'vaultType',
      vaultType,
    })
  }

  const initialState: PartialState = {
    vaultType: undefined,
    setVaultType,
  }

  return change$.pipe(
    scan(apply, initialState),
    startWith(initialState),
    switchMap((state) => {
      const { vaultType } = state
      switch (vaultType) {
        case 'borrow':
          return openVault$(ilk).pipe(map((state) => ({ vaultType, state })))
        case 'leverage':
          return openLeverageVault$(ilk).pipe(map((state) => ({ vaultType, state })))
        default:
          return of(undefined).pipe(map((state) => ({ vaultType, state })))
      }
    }),
    shareReplay(1),
  )
}

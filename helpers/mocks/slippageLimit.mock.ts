import { SLIPPAGE_DEFAULT, UserSettingsState } from 'features/userSettings/userSettings'
import { Observable, of } from 'rxjs'

export function slippageLimitMock(): Observable<UserSettingsState> {
  return of({
    stage: 'editing',
    slippage: SLIPPAGE_DEFAULT,
    slippageInput: SLIPPAGE_DEFAULT,
    setSlippageInput: () => null,
    reset: () => null,
    canProgress: true,
    errors: [],
    warnings: [],
  })
}

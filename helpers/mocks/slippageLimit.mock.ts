import { SLIPPAGE_DEFAULT } from 'features/userSettings/userSettings.constants'
import type { UserSettingsState } from 'features/userSettings/userSettings.types'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'

export function slippageLimitMock(
  mockUserData?: Partial<UserSettingsState>,
): Observable<UserSettingsState> {
  const defaultSlippageMockData: UserSettingsState = {
    stage: 'editing',
    slippage: SLIPPAGE_DEFAULT,
    slippageInput: SLIPPAGE_DEFAULT,
    setSlippageInput: () => null,
    reset: () => null,
    canProgress: true,
    errors: [],
    warnings: [],
  }
  return of({ ...defaultSlippageMockData, ...mockUserData })
}

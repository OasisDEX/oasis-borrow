import { SLIPPAGE_DEFAULT, SlippageLimitState } from 'features/slippageLimit/slippageLimit'
import { Observable, of } from 'rxjs'

export function slippageLimitMock(): Observable<SlippageLimitState> {
  return of({
    stage: 'editing',
    slippage: SLIPPAGE_DEFAULT,
    slippageInput: SLIPPAGE_DEFAULT,
    setSlippageCustom: () => null,
    setSlippageLow: () => null,
    setSlippageMedium: () => null,
    setSlippageHigh: () => null,
    reset: () => null,
    canProgress: true,
    errors: [],
    warnings: [],
  })
}

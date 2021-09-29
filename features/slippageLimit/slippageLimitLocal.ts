import BigNumber from 'bignumber.js'
import { Observable, of } from 'rxjs'

const SLIPPAGE_LOCAL_STORAGE = 'slippage_setting'

export function checkSlippageLocalStorage$(): Observable<{ slippage: string | null }> {
  const slippage = localStorage.getItem(SLIPPAGE_LOCAL_STORAGE)
  return of({ slippage })
}

export function saveSlippageLocalStorage$(slippage: BigNumber): Observable<void> {
  localStorage.setItem(SLIPPAGE_LOCAL_STORAGE, slippage.toFixed())
  return of(undefined)
}

import BigNumber from 'bignumber.js'
import { Observable, of } from 'rxjs'

const USER_SETTINGS_LOCAL_STORAGE = 'user_settings'

export function checkUserSettingsLocalStorage$(): Observable<{ slippage: string | null }> {
  const settingsSerialized = localStorage.getItem(USER_SETTINGS_LOCAL_STORAGE)

  if (settingsSerialized) {
    const { slippage }: { slippage: string | null } = JSON.parse(settingsSerialized)
    return of({ slippage })
  } else {
    return of({ slippage: null })
  }
}

export function saveUserSettingsLocalStorage$(slippage: BigNumber): Observable<boolean> {
  localStorage.setItem(
    USER_SETTINGS_LOCAL_STORAGE,
    JSON.stringify({ slippage: slippage.toFixed() }),
  )
  return of(true)
}

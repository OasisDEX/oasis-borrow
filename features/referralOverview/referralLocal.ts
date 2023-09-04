import { isAddress } from 'ethers/lib/utils'
import { Observable, of } from 'rxjs'

/**
 * Checks the referral value in local storage.
 * @returns {Observable<string | null>} An observable that emits the referral value from local storage,
 * or null if the referral is not valid or not found.
 * @dev since we only store the referrer address in local storage, we need to check if it's a valid address
 * before returning it. If not it means that the referral is not valid and we remove it from local storage.
 */
export function checkReferralLocalStorage$(): Observable<string | null> {
  const referrer = localStorage.getItem(`referral`)
  if (referrer && isAddress(referrer.slice(1, -1))) {
    return of(referrer)
  } else if (referrer === 'null') {
    return of(null)
  } else {
    localStorage.removeItem(`referral`)
    return of(null)
  }
}

export function checkReferralLocalStorage(): string | null {
  const referrer = localStorage.getItem(`referral`)
  if (referrer && isAddress(referrer.slice(1, -1))) {
    return referrer
  } else if (referrer === 'null') {
    return null
  } else {
    localStorage.removeItem(`referral`)
    return null
  }
}

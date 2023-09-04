import { ensNameToAddressMainnet } from 'blockchain/ens'
import { getAddress } from 'ethers/lib/utils'
import { Observable, of } from 'rxjs'

export function checkReferralLocalStorage$(): Observable<string | null> {
  const referrer = localStorage.getItem(`referral`)
  return checkReferrer(referrer)
}

export function checkReferralLocalStorage(): string | null {
  let referrer = localStorage.getItem(`referral`)
  if (referrer) {
    try {
      const address = getAddress(referrer)
      if (address) {
        referrer = address
      }
      return referrer
    } catch (err) {
      console.warn(`Referrals: not an address.`)
    }

    ensNameToAddressMainnet(referrer)
      .then((ensAddress) => {
        if (ensAddress) {
          localStorage.setItem(`referral`, ensAddress)
          return ensAddress
        } else {
          return null
        }
      })
      .catch((err: Error) => {
        console.warn(`Error looking up ENS name for address: ${err.message}`)
        localStorage.removeItem(`referral`)
        return null
      })
  } else if (referrer === 'null') {
    referrer = null
  }
  return null
}

function checkReferrer(referrer: string | null): Observable<string | null> {
  if (referrer) {
    try {
      const address = getAddress(referrer)
      if (address) {
        referrer = address
      }
      return of(referrer)
    } catch (err) {
      console.warn(`Referrals: not an address.`)
    }

    ensNameToAddressMainnet(referrer)
      .then((ensAddress) => {
        if (ensAddress) {
          localStorage.setItem(`referral`, ensAddress)
          return of(ensAddress)
        } else {
          return of(null)
        }
      })
      .catch((err: Error) => {
        console.warn(`Error looking up ENS name for address: ${err.message}`)
        localStorage.removeItem(`referral`)
        return of(null)
      })
  } else if (referrer === 'null') {
    referrer = null
  }
  return of(null)
}

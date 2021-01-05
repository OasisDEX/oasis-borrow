import { every10Seconds$ } from 'components/blockchain/network'
import moment from 'moment'
import { of } from 'ramda'
import { merge, Observable, Subject } from 'rxjs'
import { map, scan } from 'rxjs/operators'

type CookieType = 'cookiePrivacy' | 'cookieAppHomescreen'

export interface CookiesState {
  cookies: {
    cookiePrivacy: boolean
    cookieAppHomescreen: boolean
  }
  saveCookie: (cookieName: CookieType) => void
}

type CookieChange = {
  kind: 'cookie'
  cookieName: CookieType
  accepted: boolean
}

type ProbeCookiesChange = {
  kind: 'probeCookies'
  cookies: { [key in CookieType]: boolean }
}

type CookiesChange = CookieChange | ProbeCookiesChange

const CONSENT_DURATION = 24 * 60 * 60 * 1000
export const COOKIE_PRIVACY = 'cookiePrivacy'
export const COOKIE_APP_HOMESCREEN = 'cookieAppHomescreen'

const COOKIES: CookieType[] = [COOKIE_PRIVACY, COOKIE_APP_HOMESCREEN]

function checkCookie(cookieName: CookieType) {
  const cookieConsent = localStorage.getItem(cookieName)

  if (cookieConsent) {
    const now = moment(new Date().toUTCString())
    const cookieConsentUTC = moment(cookieConsent)
    const diff = moment(now).diff(cookieConsentUTC)

    return diff < CONSENT_DURATION
  }

  return false
}

function checkCookies() {
  const cookies: { [key in CookieType]: boolean } = {
    cookiePrivacy: false,
    cookieAppHomescreen: false,
  }

  COOKIES.forEach((cookieName) => {
    cookies[cookieName] = checkCookie(cookieName)
  })

  return cookies
}

function applyChange(state: CookiesState, change: CookiesChange): CookiesState {
  if (change.kind === 'cookie') {
    return {
      ...state,
      cookies: {
        ...state.cookies,
        [change.cookieName]: change.accepted,
      },
    }
  }

  if (change.kind === 'probeCookies') {
    return {
      ...state,
      cookies: change.cookies,
    }
  }

  return state
}

export function createCookies$(): Observable<CookiesState> {
  const change$ = new Subject<CookiesChange>()
  function change(ch: CookiesChange) {
    change$.next(ch)
  }

  function saveCookie(cookieName: CookieType) {
    localStorage.setItem(cookieName, new Date().toUTCString())
    change({ kind: 'cookie', cookieName, accepted: true })
  }

  const probeCookies$ = every10Seconds$.pipe(
    map(() => {
      change({ kind: 'probeCookies', cookies: checkCookies() })

      return of(undefined)
    }),
  )

  const initialState: CookiesState = {
    cookies: checkCookies(),
    saveCookie,
  }

  return merge(probeCookies$, change$).pipe(scan(applyChange, initialState))
}

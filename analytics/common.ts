import * as mixpanel from 'mixpanel-browser'

import { adRollScriptInsert } from './adroll'

export const COOKIE_NAMES = ['marketing', 'analytics']
export const LOCALSTORAGE_KEY = 'cookieSettings'

export type CookieName = typeof COOKIE_NAMES[number]

interface Switch {
  enable: Function
  disable: Function
}

export const manageCookie: Record<CookieName, Switch> = {
  marketing: {
    enable: () => adRollScriptInsert(),
    disable: () => {}, // no needed since adding adRoll instance to app is 0/1 like
  },
  analytics: {
    enable: () => mixpanel.opt_in_tracking(),
    disable: () => mixpanel.opt_out_tracking(),
    // todo: delete user data https://developer.mixpanel.com/docs/managing-personal-data
  },
}

export function initTrackers() {
  const trackingLocalState = localStorage.getItem(LOCALSTORAGE_KEY)

  if (trackingLocalState) {
    const state = JSON.parse(trackingLocalState).enabledCookies
    COOKIE_NAMES.forEach((cookieName) => {
      if (state[cookieName]) {
        manageCookie[cookieName].enable()
      } else {
        manageCookie[cookieName].disable()
      }
    })
  }
}

import * as mixpanel from 'mixpanel-browser'

export const COOKIE_NAMES = ['marketing', 'analytics']
export const LOCALSTORAGE_KEY = 'cookieSettings'

export type CookieName = typeof COOKIE_NAMES[number]

interface Switch {
  enable: Function
  disable: Function
}

export const manageCookie: Record<CookieName, Switch> = {
  marketing: {
    enable: () => {},
    disable: () => {}, // no needed since adding adRoll instance to app is 0/1 like
  },
  analytics: {
    enable: () => mixpanel.opt_in_tracking(),
    disable: () => mixpanel.opt_out_tracking(),
    // todo: delete user data https://developer.mixpanel.com/docs/managing-personal-data
  },
}

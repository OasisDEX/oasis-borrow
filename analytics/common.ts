export const COOKIE_NAMES = ['marketing', 'analytics']
export const COOKIE_NAMES_LOCASTORAGE_KEY = 'cookieSettings'

export type CookieName = (typeof COOKIE_NAMES)[number]

export interface Switch {
  enable: Function
  disable: Function
}

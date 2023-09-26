import * as mixpanel from 'mixpanel-browser'

import type { CookieName, Switch } from './common'

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

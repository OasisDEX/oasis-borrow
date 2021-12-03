import React from 'react'

import { CookieBanner, SavedSettings } from '../CookieBanner'

export const Default = () => {
  return <CookieBanner value={{} as SavedSettings} setValue={() => null} />
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'CookieBanner',
}

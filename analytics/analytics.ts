import * as mixpanel from 'mixpanel-browser'

const product = 'oacas'

export const trackingEvents = {
  pageView: (location: string) => {
    mixpanel.track('Pageview', {
      product,
      id: location,
    })
  },
}

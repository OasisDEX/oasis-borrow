/*
 * Copyright (C) 2020 Maker Ecosystem Growth Holdings, INC.
 */

import * as mixpanel from 'mixpanel-browser'

const env = process.env.NODE_ENV === 'production' ? 'prod' : 'test'

const config = {
  test: {
    mixpanel: {
      token: 'b7fbf14dd6a6c58feb29161f3c0fec23', // TODO: Update these once we create Borrow New Project
      config: { debug: false, ip: false, api_host: 'https://api-eu.mixpanel.com' },
    },
  },
  prod: {
    mixpanel: {
      token: 'b7fbf14dd6a6c58feb29161f3c0fec23', // TODO: Update these once we create Borrow New Project
      config: { ip: false, api_host: 'https://api-eu.mixpanel.com' },
    },
  },
}[env]

export function mixpanelInit() {
  if (config.mixpanel.config.debug) {
    console.debug(`[Mixpanel] Tracking initialized for ${env} env using ${config.mixpanel.token}`)
  }
  mixpanel.init(config.mixpanel.token, config.mixpanel.config)
  mixpanel.track('Pageview', { product: 'borrow' })
}

export function mixpanelIdentify(id: string, props: any) {
  // @ts-ignore
  if (!mixpanel.config) return
  console.debug(
    `[Mixpanel] Identifying as ${id} ${
      props && props.walletType ? `using wallet ${props.walletType}` : ''
    }`,
  )
  mixpanel.identify(id.toLowerCase())
  if (props) mixpanel.people.set(props)
}

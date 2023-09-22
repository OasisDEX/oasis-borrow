/*
 * Copyright (C) 2020 Maker Ecosystem Growth Holdings, INC.
 */

import type { Config, Mixpanel } from 'mixpanel-browser'
import * as mixpanel from 'mixpanel-browser'
import getConfig from 'next/config'

const env =
  getConfig()?.publicRuntimeConfig.mixpanelEnv === 'production' ||
  process.env.MIXPANEL_ENV === 'production'
    ? 'prod'
    : 'test'

const token = getConfig()?.publicRuntimeConfig.mixpanelAPIKey || process.env.MIXPANEL_KEY

export const config = {
  test: {
    mixpanel: {
      token,
      config: { debug: false, ip: false, api_host: 'https://mpp.staging.summer.fi' },
    },
  },
  prod: {
    mixpanel: {
      token,
      config: { ip: false, api_host: 'https://mpp.summer.fi', opt_out_tracking_by_default: true },
    },
  },
}[env]

export function mixpanelInit() {
  if (config.mixpanel.config.debug) {
    console.debug(`[Mixpanel] Tracking initialized for ${env} env using ${config.mixpanel.token}`)
  }
  mixpanel.init(config.mixpanel.token, config.mixpanel.config)
}

export function mixpanelIdentify(id: string, props: any) {
  if (!(mixpanel as Mixpanel & { config: Config }).config) return
  console.debug(
    `[Mixpanel] Identifying as ${id} ${
      props && props.walletType ? `using wallet ${props.walletType}` : ''
    }`,
  )
  mixpanel.identify(id.toLowerCase())
  if (props) mixpanel.people.set(props)
}

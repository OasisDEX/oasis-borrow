import type { Context } from 'blockchain/network.types'
import browserDetect from 'browser-detect'
import { upperFirst } from 'lodash'
import * as mixpanelBrowser from 'mixpanel-browser'
import getConfig from 'next/config'

import type { MixpanelDevelopmentType, MixpanelPropertyNameType, MixpanelType } from './types'

export function enableMixpanelDevelopmentMode<T>(mixpanel: T): T | MixpanelDevelopmentType {
  const env = getConfig()?.publicRuntimeConfig.mixpanelEnv || process.env.MIXPANEL_ENV

  if (env !== 'production' && env !== 'staging') {
    return {
      track: function (eventType: string, payload: any) {
        console.info('\n✨ Mixpanel Event: ', eventType, payload, '\n')
      },
      get_distinct_id: () => 'test_id',
      has_opted_out_tracking: () => false,
      get_property: (propertyName: MixpanelPropertyNameType) => {
        switch (propertyName) {
          case '$initial_referrer':
            return '$direct'
          case '$user_id':
            return 'test_user_id'
          default:
            return null
        }
      },
    }
  }

  return mixpanel
}

export function logMixpanelEventInDevelopmentMode(eventType: string, payload: any) {
  const env = getConfig()?.publicRuntimeConfig.mixpanelEnv || process.env.MIXPANEL_ENV

  if (env !== 'production' && env !== 'staging') {
    console.info('Mixpanel Event: ', eventType, payload)
  }
}

export let mixpanel: MixpanelType = mixpanelBrowser

mixpanel = enableMixpanelDevelopmentMode<MixpanelType>(mixpanel)

export const INPUT_DEBOUNCE_TIME = 800

// https://help.mixpanel.com/hc/en-us/articles/115004613766-Default-Properties-Collected-by-Mixpanel
export function mixpanelInternalAPI(eventName: string, eventBody: { [key: string]: any }) {
  let win: Window

  if (typeof window === 'undefined') {
    var loc = { hostname: '' }

    win = {
      navigator: { userAgent: '' },
      document: { location: loc, referrer: '' },
      screen: { width: 0, height: 0 },
      location: loc,
    } as Window
  } else {
    win = window
  }

  logMixpanelEventInDevelopmentMode(eventName, eventBody)

  const { name, mobile, os, versionNumber } = browserDetect()
  const initialReferrer = mixpanel.get_property('$initial_referrer')
  const initialReferringDomain = initialReferrer
    ? initialReferrer === '$direct'
      ? '$direct'
      : new URL(initialReferrer).hostname
    : ''
  void fetch(`/api/t`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventBody,
      eventName,
      distinctId: mixpanel.get_distinct_id(),
      currentUrl: win.location.href,
      ...(!mixpanel.has_opted_out_tracking() && {
        browser: upperFirst(name),
        browserVersion: versionNumber,
        initialReferrer,
        initialReferringDomain,
        mobile,
        os,
        screenHeight: win.innerHeight,
        screenWidth: win.innerWidth,
        userId: mixpanel.get_property('$user_id'),
      }),
    }),
  })
}

export interface MixpanelUserContext {
  walletAddres: string
  walletType: string
  browserLanguage: string
}
export function getMixpanelUserContext(language: string, context?: Context): MixpanelUserContext {
  return {
    walletAddres: context?.status === 'connected' ? context.account : 'not-connected',
    walletType: context?.status === 'connected' ? context.connectionKind : 'not-connected',
    browserLanguage: language,
  }
}

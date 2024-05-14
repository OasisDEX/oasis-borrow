'use client'
import { preloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { cleanObjectFromNull, cleanObjectToNull } from 'helpers/clean-object'
import type { AppConfigTypeKey, PreloadAppDataContext } from 'helpers/config'
import { configLSKey } from 'helpers/config'
import { merge } from 'lodash'
import { useContext } from 'react'
import type { AppConfigType } from 'types/config'
import { emptyConfig } from 'types/config'

import { configLSOverridesKey } from './constants'

/**
 * Returns config from context. If context is not available, returns empty config.
 * This gets updated when config changes (polling every configCacheTime)
 * @param configKey
 * @returns AppConfigType[T] or empty config
 */
export function useAppConfig<T extends AppConfigTypeKey>(configKey: T): AppConfigType[T] {
  try {
    const ac = useContext(preloadAppDataContext)
    if (!ac) {
      throw new Error("ConfigContext not available! getAppConfig can't be used serverside")
    }

    let justConfig = { config: { ...ac.config } }

    if (window.localStorage) {
      justConfig = merge<
        Pick<PreloadAppDataContext, 'config'>,
        Pick<PreloadAppDataContext, 'config'>
      >(justConfig, {
        config: loadConfigFromLocalStorage(),
      })
    }
    return justConfig.config[configKey] || emptyConfig[configKey]
  } catch (error) {
    console.error(`getAppConfig: Error getting config value for ${configKey}`)
    return emptyConfig[configKey]
  }
}

/**
 * Updates config overrides in localStorage
 * @param config
 * @returns void
 */
export function updateConfigOverrides(config: AppConfigType): void {
  if (!window?.localStorage) return
  let overrideConfigRaw = localStorage.getItem(configLSOverridesKey)
  if (!overrideConfigRaw) {
    overrideConfigRaw = '{}'
  }
  try {
    const overrideConfig = JSON.parse(overrideConfigRaw)
    const newOverrideConfig = merge(cleanObjectToNull(config), overrideConfig)
    localStorage.setItem(configLSOverridesKey, JSON.stringify(newOverrideConfig))
  } catch (error) {
    console.error('updateConfigOverrides: Error parsing override config from localStorage', error)
  }
}

/**
 * Saves config to localStorage
 * @param config
 * @returns void
 */
export function saveConfigToLocalStorage(config: AppConfigType) {
  if (!window?.localStorage) return
  localStorage.setItem(configLSKey, JSON.stringify(config))
  updateConfigOverrides(config)
}

/**
 * Returns currently saved config from localStorage
 * PLEASE NOTE THAT THIS IS NOT DYNAMIC, IT WILL NOT UPDATE WHEN CONFIG CHANGES (only after a refresh)
 * @returns AppConfigType or empty config
 */
export function loadConfigFromLocalStorage() {
  if (typeof localStorage === 'undefined' || !localStorage || !window?.localStorage) {
    return emptyConfig
  }
  const configRaw = localStorage.getItem(configLSKey)
  if (!configRaw) {
    console.info('loadConfigFromLocalStorage: No config found in localStorage')
    return emptyConfig
  }
  try {
    const config = merge(
      JSON.parse(configRaw),
      cleanObjectFromNull(JSON.parse(localStorage.getItem(configLSOverridesKey) ?? '{}')),
    )
    return config as AppConfigType
  } catch (error) {
    console.error('loadConfigFromLocalStorage: Error parsing config from localStorage', error)
    return emptyConfig
  }
}

/**
 * Returns currently saved config from localStorage
 * PLEASE NOTE THAT THIS IS NOT DYNAMIC, IT WILL NOT UPDATE WHEN CONFIG CHANGES (only after a refresh)
 * @param configKey
 * @returns AppConfigType[T] or empty config
 */
export function getLocalAppConfig<T extends AppConfigTypeKey>(configKey: T): AppConfigType[T] {
  if (typeof localStorage === 'undefined' || !localStorage || !window?.localStorage) {
    return emptyConfig[configKey]
  }
  return loadConfigFromLocalStorage()[configKey]
}

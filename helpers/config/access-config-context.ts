'use client'
import { configContext, emptyConfig } from 'components/context/ConfigContextProvider'
import { configLSKey, ConfigResponseType, ConfigResponseTypeKey } from 'helpers/config'
import { useContext as accessContext } from 'react'

/**
 * Returns config from context. If context is not available, returns empty config.
 * This gets updated when config changes (polling every configCacheTime)
 * @param configKey
 * @returns ConfigResponseType[T] or empty config
 */
export function getAppConfig<T extends ConfigResponseTypeKey>(configKey: T): ConfigResponseType[T] {
  try {
    const ac = accessContext(configContext)
    if (!ac) {
      throw new Error("ConfigContext not available! getAppConfig can't be used serverside")
    }
    return ac.config[configKey]
  } catch (error) {
    console.error(`getAppConfig: Error getting config value for ${configKey}`)
    return emptyConfig[configKey]
  }
}

/**
 * Saves config to localStorage
 * @param config
 * @returns void
 */
export function saveConfigToLocalStorage(config: ConfigResponseType) {
  if (!window?.localStorage) return
  localStorage.setItem(configLSKey, JSON.stringify(config))
}

/**
 * Returns currently saved config from localStorage
 * PLEASE NOTE THAT THIS IS NOT DYNAMIC, IT WILL NOT UPDATE WHEN CONFIG CHANGES (only after a refresh)
 * @returns ConfigResponseType or empty config
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
    const config = JSON.parse(configRaw)
    return config as ConfigResponseType
  } catch (error) {
    console.error('loadConfigFromLocalStorage: Error parsing config from localStorage', error)
    return emptyConfig
  }
}

/**
 * Returns currently saved config from localStorage
 * PLEASE NOTE THAT THIS IS NOT DYNAMIC, IT WILL NOT UPDATE WHEN CONFIG CHANGES (only after a refresh)
 * @param configKey
 * @returns ConfigResponseType[T] or empty config
 */
export function getAppConfigSync<T extends ConfigResponseTypeKey>(
  configKey: T,
): ConfigResponseType[T] {
  if (typeof localStorage === 'undefined' || !localStorage || !window?.localStorage) {
    return emptyConfig[configKey]
  }
  return loadConfigFromLocalStorage()[configKey]
}

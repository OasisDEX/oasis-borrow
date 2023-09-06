import { getStorageValue } from 'helpers/useLocalStorage'

export interface DangerTransactionConfig {
  enabled: boolean
  gasLimit: number
}

const DangerTransactionConfigStorageKey = 'danger-transaction-config'

export function isDangerTransactionEnabled(): DangerTransactionConfig {
  return getStorageValue(
    DangerTransactionConfigStorageKey,
    {
      enabled: false,
      gasLimit: 0,
    },
    (element?: unknown): element is DangerTransactionConfig => {
      if (!element) {
        return false
      }
      if (typeof element !== 'object') {
        return false
      }
      const elementAsObject = element as Record<string, unknown>

      return (
        elementAsObject.hasOwnProperty('enabled') &&
        elementAsObject.hasOwnProperty('gasLimit') &&
        typeof elementAsObject['enabled'] === 'boolean' &&
        typeof elementAsObject['gasLimit'] === 'number'
      )
    },
  )
}

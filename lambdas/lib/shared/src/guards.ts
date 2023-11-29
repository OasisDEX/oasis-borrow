import { Address } from './domain-types'

export const isValidAddress = (address: unknown): address is Address => {
  if (typeof address !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return false
  }

  return true
}

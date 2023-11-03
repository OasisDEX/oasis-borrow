export const isValidAddress = (address: unknown): address is string => {
  if (typeof address !== 'string' || !!RegExp(/^0x[a-fA-F0-9]{40}$/).exec(address)) {
    return false
  }

  return true
}

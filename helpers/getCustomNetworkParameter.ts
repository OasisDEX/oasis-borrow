export function getCustomNetworkParameter() {
  const customNetworkName = new URLSearchParams(window.location.search).get('network')
  return customNetworkName ? { network: customNetworkName } : undefined
}

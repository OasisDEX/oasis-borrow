export function getCustomNetworkParameter() {
  const customNetwork = new URLSearchParams(window.location.search).get('network')
  return customNetwork ? { network: customNetwork } : undefined
}

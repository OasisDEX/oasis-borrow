import { Dictionary } from 'ts-essentials'

import * as erc20 from '../abi/erc20.json'
import * as mcdOsm from '../abi/mcd-osm.json'
import { contractDesc } from '../config'

export function getOsms(addresses: Dictionary<string>, ilks: readonly string[]) {
  const keysLegalPostfixes = ilks.map((x) =>
    x.substring(0, x.indexOf('-') > 0 ? x.indexOf('-') : x.length),
  )
  return Object.entries(addresses)
    .filter(([key]) => /PIP_.*/.test(key))
    .filter(
      ([key]) => keysLegalPostfixes.filter((possibleKey) => key.endsWith(possibleKey)).length > 0,
    )
    .map(([key, address]) => ({ [key.replace('PIP_', '')]: contractDesc(mcdOsm, address) }))
    .reduce((acc, v) => ({ ...acc, ...v }), {})
}

export function getCollaterals(addresses: Dictionary<string>, ilks: readonly string[]) {
  const keysLegalPostfixes = ilks.map((x) =>
    x.substring(0, x.indexOf('-') > 0 ? x.indexOf('-') : x.length),
  )
  return Object.entries(addresses)
    .filter(([key]) => /PIP_.*/.test(key))
    .filter(([key]) => key !== 'ETH')
    .filter(
      ([key]) =>
        keysLegalPostfixes.filter((possibleKey) => {
          return key.endsWith(possibleKey)
        }).length > 0,
    )
    .map(([key]) => key.replace('PIP_', ''))
}

export function getCollateralTokens(addresses: Dictionary<string>, ilks: readonly string[]) {
  return getCollaterals(addresses, ilks)
    .map((token) => ({ [token]: contractDesc(erc20, addresses[token]) }))
    .reduce((acc, v) => ({ ...acc, ...v }), {})
}

export function getCollateralJoinContracts(addresses: Dictionary<string>, ilks: readonly string[]) {
  return Object.entries(addresses)
    .filter(([key]) => /MCD_JOIN_(.*)/.test(key))
    .map(([key, address]) => [key.replace('MCD_JOIN_', '').replace(/_/g, '-'), address])
    .filter(([key]) => ilks.includes(key))
    .reduce((acc, [ilk, address]) => ({ ...acc, [ilk]: address }), {} as Dictionary<string>)
}

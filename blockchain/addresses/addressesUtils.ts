import { Dictionary } from 'ts-essentials'
import * as erc20 from '../abi/erc20.json'
import * as mcdOsm from '../abi/mcd-osm.json'
import { contractDesc } from '../config'

export function getOsms(addresses: Dictionary<string>) {
  return Object.entries(addresses)
    .filter(([key]) => /PIP_.*/.test(key))
    .map(([key, address]) => ({ [key.replace('PIP_', '')]: contractDesc(mcdOsm, address) }))
    .reduce((acc, v) => ({ ...acc, ...v }), {})
}

export function getCollaterals(addresses: Dictionary<string>) {
  return Object.entries(addresses)
    .filter(([key]) => /PIP_.*/.test(key))
    .filter(([key]) => key !== 'ETH')
    .map(([key]) => key.replace('PIP_', ''))
}

export function getCollateralTokens(addresses: Dictionary<string>) {
  return getCollaterals(addresses)
    .map((token) => ({ [token]: contractDesc(erc20, addresses[token]) }))
    .reduce((acc, v) => ({ ...acc, ...v }), {})
}

export function getCollateralJoinContracts(addresses: Dictionary<string>) {
  return Object.entries(addresses)
    .filter(([key]) => /MCD_JOIN_(.*)/.test(key))
    .map(([key, address]) => [key.replace('MCD_JOIN_', '').replace('_', '-'), address])
    .reduce((acc, [ilk, address]) => ({ ...acc, [ilk]: address }), {} as Dictionary<string>)
}

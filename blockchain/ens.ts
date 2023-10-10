import { ethers } from 'ethers'
import { useMemo, useState } from 'react'
import type { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import type { Context } from './network.types'
import { getNetworkRpcEndpoint, NetworkIds } from './networks'

export function resolveENSName$(context$: Observable<Context>, address: string) {
  return context$.pipe(
    switchMap(async (context) => {
      const provider = new ethers.providers.JsonRpcBatchProvider(
        getNetworkRpcEndpoint(context.chainId),
      )
      return provider
        .lookupAddress(address)
        .catch((err: Error) =>
          console.warn(`Error looking up ENS name for address: ${err.message}`),
        )
    }),
  )
}

// address => ens name
export async function addressToEnsNameMainnet(address: string) {
  const provider = new ethers.providers.JsonRpcBatchProvider(
    getNetworkRpcEndpoint(NetworkIds.MAINNET),
  )
  return provider.lookupAddress(address).catch((err: Error) => {
    console.warn(`Error looking up ENS name for address: ${address}/${err.message}`)
    return null
  })
}

// ens name => address
export async function ensNameToAddressMainnet(ensName: string) {
  const provider = new ethers.providers.JsonRpcBatchProvider(
    getNetworkRpcEndpoint(NetworkIds.MAINNET),
  )
  return provider.resolveName(ensName).catch((err: Error) => {
    console.warn(`Error looking up ENS name for address: ${err.message}`)
    return null
  })
}

/**
 * A hook that returns the ENS name for a given Ethereum address on the mainnet.
 * @param address The Ethereum address to look up the ENS name for.
 * @returns A tuple containing the ENS name for the address, or `null` if the address is not registered with ENS, or `undefined` if the ENS name lookup is still in progress.
 */
export const useMainnetEnsName = (address?: string | null) => {
  const [ensName, setEnsName] = useState<string | null | undefined>(undefined)
  useMemo(() => {
    if (!address) return
    addressToEnsNameMainnet(address)
      .then((name) => {
        name !== null && setEnsName(name)
        name === null && setEnsName(null)
      })
      .catch((err: Error) => {
        console.warn(`Error looking up ENS name for address: ${err.message}`)
      })
  }, [address])

  return [ensName]
}

export const useMainnetEnsNames = (addresses?: string[]) => {
  const initialAddressesList: { [key: string]: string } = {}
  addresses?.forEach((address) => {
    initialAddressesList[address] = address
  })
  const [ensNames, setEnsNames] = useState<{ [key: string]: string }>(initialAddressesList)

  useMemo(() => {
    if (!addresses || !addresses.length) return
    Promise.all(addresses.map((address) => addressToEnsNameMainnet(address)))
      .then((names) => {
        const newEnsNames: { [key: string]: string } = {}
        names.forEach((name, index) => {
          if (name !== null) {
            newEnsNames[addresses[index]] = name
          } else {
            newEnsNames[addresses[index]] = addresses[index]
          }
        })
        setEnsNames(newEnsNames)
      })
      .catch((err: Error) => {
        console.warn(`Error looking up ENS name for address: ${err.message}`)
      })
  }, [addresses?.sort().join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  return [ensNames]
}

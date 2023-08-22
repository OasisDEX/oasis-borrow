import { ethers } from 'ethers'
import { useMemo, useState } from 'react'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { Context } from './network'
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

export const useMainnetEnsName = (address?: string | null) => {
  const [ensName, setEnsName] = useState<string | null>(address || null)

  useMemo(() => {
    if (!address) return
    addressToEnsNameMainnet(address)
      .then((name) => {
        name !== null && setEnsName(name)
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

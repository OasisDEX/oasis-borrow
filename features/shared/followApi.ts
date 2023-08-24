import { Protocol, UsersWhoFollowVaults } from '@prisma/client'
import BigNumber from 'bignumber.js'
import getConfig from 'next/config'

const basePath = getConfig()?.publicRuntimeConfig?.basePath || ''

export async function followVaultUsingApi(
  vaultId: BigNumber,
  chainId: number,
  protocol: Protocol,
  token: string,
): Promise<UsersWhoFollowVaults[]> {
  return fetch(`${basePath}/api/follow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: JSON.stringify({
      vault_id: parseInt(vaultId.toFixed(0)),
      vault_chain_id: chainId,
      protocol,
    }),
  })
    .then((resp) => {
      return resp.json() as unknown as UsersWhoFollowVaults[]
    })
    .catch((err) => {
      if (err.status === 404) {
        return [] as UsersWhoFollowVaults[]
      }
      throw err
    })
}

export function getFollowFromApi(address: string): Promise<UsersWhoFollowVaults[]> {
  return fetch(`${basePath}/api/follow/${address}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((resp) => {
      return resp.json() as unknown as UsersWhoFollowVaults[]
    })
    .catch((err) => {
      if (err.status === 404) {
        return [] as UsersWhoFollowVaults[]
      }
      if (err.status === 422 || err.status === 418) {
        return err.json()
      }
      throw err
    })
}

export async function unfollowVaultUsingApi(
  vaultId: BigNumber,
  chainId: number,
  protocol: Protocol,
  token: string,
): Promise<{ message: String }> {
  return fetch(`${basePath}/api/follow`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: JSON.stringify({
      vault_id: parseInt(vaultId.toFixed(0)),
      vault_chain_id: chainId,
      protocol,
    }),
  })
    .then((resp) => {
      return resp.json()
    })
    .catch((err) => {
      if (err.status === 404) {
        return []
      }
      throw err
    })
}

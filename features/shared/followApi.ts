import { UsersWhoFollowVaults } from '@prisma/client'
import BigNumber from 'bignumber.js'
import getConfig from 'next/config'

const basePath = getConfig()?.publicRuntimeConfig?.basePath || ''

export async function followVaultUsingApi(
  vaultId: BigNumber,
  followerAddress: string,
  docVersion: string,
  chainId: number,
  token: string,
): Promise<UsersWhoFollowVaults[]> {
  return fetch(`${basePath}/api/follow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: JSON.stringify({
      user_address: followerAddress,
      vault_id: parseInt(vaultId.toFixed(0)),
      tos_doc_version: docVersion,
      vault_chain_id: chainId,
    }),
  })
    .then((resp) => {
      return resp.json() as UsersWhoFollowVaults[]
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
      // console.log('resp.json()')
      // console.log(resp.json())
      return resp.json() as UsersWhoFollowVaults[]
    })
    .catch((err) => {
      if (err.status === 404) {
        return [] as UsersWhoFollowVaults[]
      }
      throw err
    })
}

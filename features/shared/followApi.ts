import { UsersWhoFollowVaults } from '@prisma/client'
import BigNumber from 'bignumber.js'
import getConfig from 'next/config'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { map } from 'rxjs/operators'

const basePath = getConfig()?.publicRuntimeConfig?.basePath || ''

// TODO ŁW rewrite to fetch and async function
export function followVaultUsingApi$(
  vaultId: BigNumber,
  followerAddress: string,
  docVersion: string,
  chainId: number,
  token: string,
): Observable<void> {
  return ajax({
    url: `${basePath}/api/follow`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: {
      user_address: followerAddress,
      vault_id: parseInt(vaultId.toFixed(0)),
      tos_doc_version: docVersion,
      vault_chain_id: chainId,
    },
  }).pipe(map((_) => {}))
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

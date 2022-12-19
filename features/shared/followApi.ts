import { UsersWhoFollowVaults } from '@prisma/client'
import BigNumber from 'bignumber.js'
import getConfig from 'next/config'
import { of } from 'ramda'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

const basePath = getConfig()?.publicRuntimeConfig?.basePath || ''

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

export function getFollowFromApi$(address: string): Observable<UsersWhoFollowVaults[] | undefined> {
  return ajax({
    url: `${basePath}/api/follow/${address}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).pipe(
    map((resp) => {
      return resp.response
    }),
    catchError((err) => {
      if (err.xhr.status === 404) {
        return of({})
      }
      throw err
    }),
  )
}

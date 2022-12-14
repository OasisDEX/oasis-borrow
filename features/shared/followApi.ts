import BigNumber from 'bignumber.js'
import getConfig from 'next/config'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { map } from 'rxjs/operators'

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

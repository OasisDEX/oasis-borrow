import { UsersWhoFollowVaults } from '@prisma/client'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { map } from 'rxjs/operators'

export function followedVaults$(address: string): Observable<UsersWhoFollowVaults[]> {
  const url = `/api/follow/${address}`

  return ajax({ url, method: 'GET' }).pipe(map(({ response }) => response))
}

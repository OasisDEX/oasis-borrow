import { User, WeeklyClaim } from '@prisma/client'
import getConfig from 'next/config'
import { of } from 'ramda'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

const basePath = getConfig()?.publicRuntimeConfig?.basePath || ''

export function getUserFromApi$(address: String): Observable<User | null> {
  return ajax({
    url: `${basePath}/api/user/${address}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).pipe(
    map((resp) => {
      const user = resp.response as User
      return user
    }),
    catchError((err) => {
      if (err.xhr.status === 404) {
        return of(null)
      }
      throw err
    }),
  )
}
export function getReferralsFromApi$(address: String): Observable<User[] | null> {
  return ajax({
    url: `${basePath}/api/user/referrals/${address}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).pipe(
    map((resp) => {
      const users = resp.response as User[]
      return users
    }),
    catchError((err) => {
      if (err.xhr.status === 404) {
        return of(null)
      }
      throw err
    }),
  )
}
export function getTopEarnersFromApi$(): Observable<User[] | null> {
  return ajax({
    url: `${basePath}/api/user/top`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).pipe(
    map((resp) => {
      const users = resp.response as User[]
      return users
    }),
    catchError((err) => {
      if (err.xhr.status === 404) {
        return of(null)
      }
      throw err
    }),
  )
}
export function getWeeklyClaimsFromApi$(address: String): Observable<WeeklyClaim[] | null> {
  return ajax({
    url: `${basePath}/api/user/claims/${address}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).pipe(
    map((resp) => {
      const users = resp.response as WeeklyClaim[]
      return users
    }),
    catchError((err) => {
      if (err.xhr.status === 404) {
        return of(null)
      }
      throw err
    }),
  )
}
export function saveUserUsingApi$(
  accept: boolean,
  referrer: string,
  address: string,
  token: string
): Observable<void> {
  return ajax({
    url: `${basePath}/api/user/create`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: {
      user_that_referred_address: accept ? referrer : '0x000000000000000000000000000000000000dead',
      address: address,
    },
  }).pipe(map((_) => {}))
}

export function updateClaimsUsingApi$(
  user_address: string,
  week_number: Number[],
  token: string
): Observable<void> {
  console.log(week_number)
  return ajax({
    url: `${basePath}/api/user/claims/update`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: {
      user_address,
      week_number,
    },
  }).pipe(map((_) => {}))
}
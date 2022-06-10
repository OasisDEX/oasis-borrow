import { User, WeeklyClaim } from '@prisma/client'
import getConfig from 'next/config'
import { of } from 'ramda'
import { Observable, Subject } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

const basePath = getConfig()?.publicRuntimeConfig?.basePath || ''

export function getUserFromApi$(address: string, trigger$: Subject<void>): Observable<User | null> {
  return trigger$.pipe(
    startWith(
      ajax({
        url: `${basePath}/api/user/${address}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).pipe(
        map((resp) => {
          return resp.response as User
        }),
        catchError((err) => {
          if (err.xhr.status === 404) {
            return of(null)
          }
          throw err
        }),
      ),
    ),
    switchMap((_) => {
      return ajax({
        url: `${basePath}/api/user/${address}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).pipe(
        map((resp) => {
          return resp.response as User
        }),
        catchError((err) => {
          if (err.xhr.status === 404) {
            return of(null)
          }
          throw err
        }),
      )
    }),
  )
}
export function getReferralsFromApi$(address: string): Observable<User[] | null> {
  return ajax({
    url: `${basePath}/api/user/referrals/${address}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).pipe(
    map((resp) => {
      return resp.response as User[]
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
      return resp.response as User[]
    }),
    catchError((err) => {
      if (err.xhr.status === 404) {
        return of(null)
      }
      throw err
    }),
  )
}
export function getWeeklyClaimsFromApi$(
  address: string,
  trigger$: Subject<void>,
): Observable<WeeklyClaim[] | null> {
  return trigger$.pipe(
    startWith(
      ajax({
        url: `${basePath}/api/user/claims/${address}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).pipe(
        map((resp) => {
          return resp.response as WeeklyClaim[]
        }),
        catchError((err) => {
          if (err.xhr.status === 404) {
            return of(null)
          }
          throw err
        }),
      ),
    ),
    switchMap((_) => {
      return ajax({
        url: `${basePath}/api/user/claims/${address}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).pipe(
        map((resp) => {
          return resp.response as WeeklyClaim[]
        }),
        catchError((err) => {
          if (err.xhr.status === 404) {
            return of(null)
          }
          throw err
        }),
      )
    }),
  )
}
export function createUserUsingApi$(
  accepted: boolean,
  referrer: string | null,
  address: string,
  token: string,
): Observable<number> {
  return ajax({
    url: `${basePath}/api/user/create`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: {
      user_that_referred_address: referrer,
      address: address,
      accepted: accepted,
    },
  }).pipe(map((resp) => resp.status))
}

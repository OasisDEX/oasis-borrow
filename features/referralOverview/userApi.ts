import type { User, WeeklyClaim } from '@prisma/client'
import { of } from 'ramda'
import type { Observable, Subject } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

export function getUserFromApi$(address: string, trigger$: Subject<void>): Observable<User | null> {
  return trigger$.pipe(
    startWith(
      ajax({
        url: `/api/user/${address}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).pipe(
        map((resp) => {
          return resp.response as User | null
        }),
        catchError((err) => {
          if (err.xhr.status === 404) {
            return of(undefined)
          }
          throw err
        }),
      ),
    ),
    switchMap((_) => {
      return ajax({
        url: `/api/user/${address}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).pipe(
        map((resp) => {
          return resp.response as User | null
        }),
        catchError((err) => {
          if (err.xhr.status === 404) {
            return of(undefined)
          }
          throw err
        }),
      )
    }),
  )
}
export function getReferralsFromApi$(address: string): Observable<User[] | null> {
  return ajax({
    url: `/api/user/referrals/${address}`,
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
    url: `/api/user/top`,
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
export function getReferralRewardsFromApi$(
  address: string,
  trigger$: Subject<void>,
): Observable<WeeklyClaim[] | null> {
  return trigger$.pipe(
    startWith(
      ajax({
        url: `/api/user/claims/${address}`,
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
        url: `/api/user/claims/${address}`,
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
    url: `/api/user/create`,
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

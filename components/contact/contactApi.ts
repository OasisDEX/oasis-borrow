import { Observable, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map, startWith } from 'rxjs/operators'

import { ContactFormStage } from './contact'

export type ContactData = {
  name?: string
  email: string
  subject: string
  message: string
}

export interface ContactRequestResponse {
  status: ContactFormStage
}

export function contactApi$(data: ContactData): Observable<ContactRequestResponse> {
  return ajax.post('/api/contact', { data }, { 'Content-Type': 'application/json' }).pipe(
    map(() => {
      return { status: 'success' as ContactFormStage }
    }),
    catchError((err) => {
      console.error(err)
      return of({
        status: 'failure' as ContactFormStage,
      })
    }),
    startWith({ status: 'inProgress' as ContactFormStage }),
  )
}

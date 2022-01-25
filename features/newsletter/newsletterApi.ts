import { Observable, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map, startWith } from 'rxjs/operators'

import { NewsletterStage } from './newsletter'

export type NewsletterData = {
  email: string
}

export type NewsletterResponseMessage = 'emailAlreadyExists' | 'emailPending' | 'unknown'

export interface NewsletterResponse {
  status: NewsletterStage
  message?: NewsletterResponseMessage
}

export function newsletterApi$(data: NewsletterData): Observable<NewsletterResponse> {
  return ajax
    .post(
      '/api/newsletter-subscribe',
      { ...data },
      { Accept: 'application/json', 'Content-Type': 'application/json' },
    )
    .pipe(
      map(() => {
        return { status: 'success' as NewsletterStage }
      }),
      catchError((err) => {
        return of({
          status: 'error',
          message: err.xhr.response.error,
        })
      }),
      startWith({ status: 'inProgress' as NewsletterStage }),
    )
}

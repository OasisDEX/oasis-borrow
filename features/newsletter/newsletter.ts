import { EMAIL_REGEX } from 'helpers/constants'
import { applyChange, Change, Changes } from 'helpers/form'
import { curry } from 'lodash'
import { merge, Observable, Subject } from 'rxjs'
import { map, scan, shareReplay, startWith } from 'rxjs/operators'

import { newsletterApi$, NewsletterResponseMessage } from './newsletterApi'

export type NewsletterStage = 'editing' | 'inProgress' | 'success' | 'error'

export type NewsletterMessage = 'emailIsInvalid'

type NewsletterChange = Changes<NewsletterState>

type ManualChange = Change<NewsletterState, 'email'> | Change<NewsletterState, 'messageResponse'>

export interface NewsletterState {
  email: string
  messages: NewsletterMessage[]
  stage: NewsletterStage
  change: (change: ManualChange) => void
  submit?: () => void
  messageResponse?: NewsletterResponseMessage
}

const initialState: Omit<NewsletterState, 'change' | 'submit'> = {
  email: '',
  messages: [],
  stage: 'editing',
}

function submit({ email }: NewsletterState, change: (change: NewsletterChange) => void) {
  newsletterApi$({ email }).subscribe(({ status, message }) => {
    change({ kind: 'stage', stage: status })

    if (message) {
      change({ kind: 'messageResponse', messageResponse: message })
    }
  })
}

function apply(state: NewsletterState, change: NewsletterChange) {
  if (change.kind === 'email') {
    return {
      ...state,
      email: change.email,
      messageResponse: undefined,
    }
  }

  return applyChange(state, change)
}

function addTransitions(
  change: (change: NewsletterChange) => void,
  state: NewsletterState,
): NewsletterState {
  const { messages, email } = state

  if (email && messages.length === 0) {
    return {
      ...state,
      submit: () => {
        change({ kind: 'messageResponse', messageResponse: undefined })
        submit(state, change)
      },
    }
  }

  return state
}

function validate(state: NewsletterState): NewsletterState {
  const { email } = state
  const messages: NewsletterMessage[] = []

  if (email && !EMAIL_REGEX.test(email)) {
    messages.push('emailIsInvalid')
  }

  return { ...state, messages }
}

export function createNewsletter$(): Observable<NewsletterState> {
  const change$ = new Subject<NewsletterChange>()
  function change(ch: NewsletterChange) {
    change$.next(ch)
  }

  const state: NewsletterState = {
    ...initialState,
    change,
  }

  return merge(change$).pipe(
    scan(apply, state),
    map(validate),
    map(curry(addTransitions)(change)),
    startWith(state),
    shareReplay(1),
  )
}

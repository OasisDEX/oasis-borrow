import { EMAIL_REGEX } from 'helpers/constants'
import { curry } from 'ramda'
import { merge, Observable, Subject } from 'rxjs'
import { map, scan, shareReplay, startWith } from 'rxjs/operators'

import { contactApi$ } from './contactApi'

export type FormField = 'name' | 'email' | 'subject' | 'message'

type MessageKind = 'emailIsInvalid'

export type ContactFormStage = 'editing' | 'inProgress' | 'success' | 'failure'

export type ContactFormMessage = {
  kind: MessageKind
  field: FormField
}

interface NameChange {
  kind: 'name'
  value: string
}

interface EmailChange {
  kind: 'email'
  value: string
}

interface SubjectChange {
  kind: 'subject'
  value: string
}

interface MessageChange {
  kind: 'message'
  value: string
}

interface StageChange {
  kind: 'stage'
  value: ContactFormStage
}

export type ContactFormChange =
  | NameChange
  | EmailChange
  | SubjectChange
  | MessageChange
  | StageChange

export interface ContactFormState {
  name: string
  email: string
  subject: string
  message: string
  messages: ContactFormMessage[]
  stage: ContactFormStage
  change: (change: ContactFormChange) => void
  submit?: (params?: any) => void
}

const initialState = {
  name: '',
  email: '',
  subject: '',
  message: '',
  messages: [],
  stage: 'editing' as ContactFormStage,
}

function applyChange(state: ContactFormState, change: ContactFormChange): ContactFormState {
  const { kind, value } = change
  switch (kind) {
    case 'name':
      return {
        ...state,
        name: value,
      }
    case 'email':
      return {
        ...state,
        email: value,
      }
    case 'subject':
      return {
        ...state,
        subject: value,
      }
    case 'message':
      return {
        ...state,
        message: value,
      }
    case 'stage':
      return {
        ...state,
        stage: value as ContactFormStage,
      }
    default:
      return state
  }
}

function validate(state: ContactFormState): ContactFormState {
  const { email } = state
  const messages: ContactFormMessage[] = []

  if (email && !EMAIL_REGEX.test(email)) {
    messages.push({
      kind: 'emailIsInvalid',
      field: 'email',
    })
  }

  return { ...state, messages }
}

function submit(
  { name, email, subject, message }: ContactFormState,
  change: (change: ContactFormChange) => void,
) {
  contactApi$({ name, email, subject, message }).subscribe(({ status }) =>
    change({ kind: 'stage', value: status }),
  )
}

function addTransitions(
  change: (change: ContactFormChange) => void,
  state: ContactFormState,
): ContactFormState {
  const { messages, email, message, subject } = state

  if (email && message && subject && messages.length === 0) {
    return {
      ...state,
      submit: () => submit(state, change),
    }
  }

  return state
}

export function createContactForm(): Observable<ContactFormState> {
  const change$ = new Subject<ContactFormChange>()
  function change(ch: ContactFormChange) {
    change$.next(ch)
  }

  const state: ContactFormState = {
    ...initialState,
    change,
  }

  return merge(change$).pipe(
    scan(applyChange, state),
    map(validate),
    map(curry(addTransitions)(change)),
    startWith(state),
    shareReplay(1),
  )
}

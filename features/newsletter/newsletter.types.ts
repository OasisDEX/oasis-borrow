import type { Change, Changes } from 'helpers/form'
export type NewsletterStage = 'editing' | 'inProgress' | 'success' | 'error'

export type NewsletterMessage = 'emailIsInvalid'

export type NewsletterChange = Changes<NewsletterState>

export type ManualChange =
  | Change<NewsletterState, 'email'>
  | Change<NewsletterState, 'messageResponse'>

export interface NewsletterState {
  email: string
  messages: NewsletterMessage[]
  stage: NewsletterStage
  change: (change: ManualChange) => void
  submit?: () => void
  messageResponse?: NewsletterResponseMessage
}

export type NewsletterData = {
  email: string
}

export type NewsletterResponseMessage = 'emailAlreadyExists' | 'emailPending' | 'unknown'

export interface NewsletterResponse {
  status: NewsletterStage
  message?: NewsletterResponseMessage
}

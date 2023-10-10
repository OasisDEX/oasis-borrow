export type TermsAcceptanceStage =
  | 'walletConnectionInProgress'
  | 'acceptanceCheckInProgress'
  | 'acceptanceCheckFailed'
  | 'acceptanceWaiting4TOSAcceptance'
  | 'jwtAuthWaiting4Acceptance'
  | 'jwtAuthInProgress'
  | 'jwtAuthFailed'
  | 'jwtAuthRejected'
  | 'jwtInvalidProgress'
  | 'jwtInvalidWaiting4Acceptance'
  | 'acceptanceSaveInProgress'
  | 'acceptanceSaveFailed'
  | 'acceptanceAccepted'
  | 'acceptanceProcessClosed'

export interface TermsAcceptanceState {
  stage: TermsAcceptanceStage
  acceptTOS?: () => void
  acceptJwtAuth?: () => void
  rejectJwtAuth?: () => void
  restart?: () => void
  tryAgain?: () => void
  error?: any
  updated?: boolean
}

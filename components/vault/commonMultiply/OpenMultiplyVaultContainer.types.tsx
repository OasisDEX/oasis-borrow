import type { ReactElement } from 'react'

export interface OpenMultiplyVaultContainerProps {
  clear: () => void
  details: ReactElement
  form: ReactElement
  header: ReactElement
  faq?: ReactElement
}

export enum RefinanceTransactionStep {
  Dpm = 'dpm',
  Manage = 'manage',
  Risk = 'risk',
  Setup = 'setup',
  Transaction = 'transaction',
  Transition = 'transition',
}

export interface RefinanceTransactionManagerProps {
  steps: RefinanceTransactionStep[]
}

export function RefinanceTransactionManager({ steps }: RefinanceTransactionManagerProps) {
  return {}
}

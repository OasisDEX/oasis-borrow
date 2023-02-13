import { AjnaBorrowFormState } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { GeneralStepManager } from 'features/ajna/contexts/ajnaStepManager'

interface StepManagerWithBorrowForm extends GeneralStepManager {
  formState: AjnaBorrowFormState
}

export function isBorrowStepValid({ currentStep, formState }: StepManagerWithBorrowForm) {
  switch (currentStep) {
    case 'setup':
    case 'manage':
      switch (formState.action) {
        case 'open':
        case 'deposit':
          return !!formState.depositAmount?.gt(0)
        case 'withdraw':
          return !!formState.withdrawAmount?.gt(0)
        case 'generate':
          return !!formState.generateAmount?.gt(0)
        case 'payback':
          return !!formState.paybackAmount?.gt(0)
        default:
          return false
      }
    default:
      return true
  }
}

import { AjnaBorrowFormState } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { GeneralStepManager } from 'features/ajna/contexts/ajnaStepManager'

interface StepManagerWithBorrowForm extends GeneralStepManager {
  formState: AjnaBorrowFormState
}

export function isBorrowStepValid({ currentStep, formState }: StepManagerWithBorrowForm) {
  switch (currentStep) {
    case 'setup':
      return !!formState.depositAmount?.gt(0)
    default:
      return true
  }
}

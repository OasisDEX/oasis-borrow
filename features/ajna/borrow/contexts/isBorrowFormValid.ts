import { ValidationMessagesInput } from 'components/ValidationMessages'
import { AjnaBorrowFormState } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { GeneralStepManager } from 'features/ajna/contexts/ajnaStepManager'

interface IsBorrowFormValidParams extends GeneralStepManager {
  formState: AjnaBorrowFormState
  errors?: ValidationMessagesInput
}

export function isBorrowFormValid({
  currentStep,
  formState: { action, generateAmount, depositAmount, paybackAmount, withdrawAmount },
  errors,
}: IsBorrowFormValidParams) {
  if (errors && errors.messages.length > 0) return false

  switch (currentStep) {
    case 'setup':
    case 'manage':
      switch (action) {
        case 'open':
        case 'deposit':
          return !!depositAmount?.gt(0)
        case 'withdraw':
          return !!withdrawAmount?.gt(0)
        case 'generate':
          return !!generateAmount?.gt(0)
        case 'payback':
          return !!paybackAmount?.gt(0)
        default:
          return false
      }
    default:
      return true
  }
}

import { ValidationMessagesInput } from 'components/ValidationMessages'
import { GeneralStepManager } from 'features/ajna/contexts/ajnaStepManager'
import { AjnaEarnFormState } from 'features/ajna/earn/state/ajnaEarnFormReducto'

interface IsBorrowFormValidParams extends GeneralStepManager {
  formState: AjnaEarnFormState
  errors?: ValidationMessagesInput
}

// TODO adjust form state and cases here
export function isEarnFormValid({
  currentStep,
  formState: { action, depositAmount, withdrawAmount },
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
        default:
          return false
      }
    default:
      return true
  }
}

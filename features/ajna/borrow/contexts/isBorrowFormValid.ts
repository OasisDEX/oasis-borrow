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
        case 'openBorrow':
        case 'depositBorrow':
          return !!depositAmount?.gt(0)
        case 'withdrawBorrow':
          return !!withdrawAmount?.gt(0)
        case 'generateBorrow':
          return !!generateAmount?.gt(0)
        case 'paybackBorrow':
          return !!paybackAmount?.gt(0)
        default:
          return false
      }
    default:
      return true
  }
}

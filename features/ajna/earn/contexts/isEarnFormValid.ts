import { ValidationMessagesInput } from 'components/ValidationMessages'
import { GeneralStepManager } from 'features/ajna/contexts/ajnaStepManager'
import { AjnaEarnFormState } from 'features/ajna/earn/state/ajnaEarnFormReducto'

interface IsBorrowFormValidParams extends GeneralStepManager {
  formState: AjnaEarnFormState
  errors?: ValidationMessagesInput
}

export function isEarnFormValid({ errors }: IsBorrowFormValidParams) {
  if (errors && errors.messages.length > 0) return false

  // TODO: add switch checking if values are empty
  return true
}

import { AjnaPosition } from '@oasisdex/oasis-actions-poc'
import BigNumber from 'bignumber.js'

// TODO: temporary interface, replace with one imported from lib
export interface AjnaMultiplyPosition extends AjnaPosition {
  multiply: BigNumber
}

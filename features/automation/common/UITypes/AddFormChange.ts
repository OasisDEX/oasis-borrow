import BigNumber from 'bignumber.js'
import { VaultViewMode } from 'components/TabSwitchLayout'

export interface AddFormChange {
  selectedSLValue: BigNumber
  collateralActive: boolean
}

export interface TabChange {
  currentMode: VaultViewMode
}

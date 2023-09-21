import type BigNumber from 'bignumber.js'
import type { SelectedDaiAllowanceRadio } from 'components/vault/commonMultiply/ManageVaultDaiAllowance.types'
import type {
  DsrDepositStage,
  DsrDepositState,
  DsrSidebarTabOptions,
} from 'features/dsr/helpers/dsrDeposit.types'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import type { ChangeEvent } from 'react'

export interface DsrSidebarProps {
  activeTab: DsrSidebarTabOptions
  daiBalance: BigNumber
  sDaiBalance: BigNumber
  onDepositAmountChange: (e: ChangeEvent<HTMLInputElement>) => void
  depositInputValue?: BigNumber
  withDrawInputValue?: BigNumber
  onPrimaryButtonClick?: () => void
  stage: DsrDepositStage
  proxyAddress?: string
  daiAllowance?: BigNumber
  daiWalletAllowance?: BigNumber
  isLoading: boolean
  isOwner: boolean
  dsrDepositState: DsrDepositState
  operationChange: (operation: DsrSidebarTabOptions) => void
  netValue: BigNumber
  gasData: HasGasEstimation
  validationMessages: string[]
  selectedAllowanceRadio?: SelectedDaiAllowanceRadio
  allowanceAmount?: BigNumber
}

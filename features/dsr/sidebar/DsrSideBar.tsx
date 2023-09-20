import type BigNumber from 'bignumber.js'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import type { SelectedDaiAllowanceRadio } from 'components/vault/commonMultiply/ManageVaultDaiAllowance.types'
import { SidebarVaultAllowanceStage } from 'components/vault/sidebar/SidebarVaultAllowanceStage'
import { SidebarVaultProxyStage } from 'components/vault/sidebar/SidebarVaultProxyStage'
import { getIsAllowanceStage } from 'features/allowance/allowance'
import { DsrEditing } from 'features/dsr/containers/DsrEditing'
import type { DsrDepositStage, DsrDepositState } from 'features/dsr/helpers/dsrDeposit'
import { DsrSidebarCreation } from 'features/dsr/sidebar/DsrSidebarCreation'
import { createPrimaryButtonLabel, isDsrButtonDisabled } from 'features/dsr/utils/helpers'
import { isProxyStage } from 'features/proxy/proxy'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { ChangeEvent } from 'react'
import React, { useMemo } from 'react'
import { Grid } from 'theme-ui'

export type DsrSidebarTabOptions = 'deposit' | 'withdraw' | 'convert'

interface DsrSidebarProps {
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

export function DsrSideBar({
  activeTab,
  daiBalance,
  sDaiBalance,
  onDepositAmountChange,
  depositInputValue,
  onPrimaryButtonClick,
  stage,
  isLoading,
  withDrawInputValue,
  proxyAddress,
  daiAllowance,
  daiWalletAllowance,
  dsrDepositState,
  isOwner,
  operationChange,
  netValue,
  gasData,
  validationMessages,
  selectedAllowanceRadio,
  allowanceAmount,
}: DsrSidebarProps) {
  const { t } = useTranslation()

  const primaryButtonlabel = useMemo(() => {
    return createPrimaryButtonLabel({
      stage,
      activeTab,
      depositInputValue,
      proxyAddress,
      daiAllowance,
      daiWalletAllowance,
      isMintingSDai: dsrDepositState.isMintingSDai,
    })
  }, [stage, activeTab, proxyAddress, depositInputValue?.toNumber(), dsrDepositState.isMintingSDai])

  const sidebarSectionProps: SidebarSectionProps = {
    title: t(netValue.gt(zero) ? 'dsr.titles.manage' : 'dsr.titles.setup'),
    content: (
      <Grid gap={3}>
        {isProxyStage(stage) && <SidebarVaultProxyStage stage={stage} gasData={gasData} />}
        {getIsAllowanceStage(stage) && (
          // @ts-ignore
          <SidebarVaultAllowanceStage
            {...dsrDepositState}
            depositAmount={depositInputValue}
            token="DAI"
          />
        )}
        {['editing', 'depositFiasco', 'withdrawFiasco'].includes(stage) && (
          <DsrEditing
            isLoading={isLoading}
            activeTab={activeTab}
            stage={stage}
            onDepositAmountChange={onDepositAmountChange}
            depositInputValue={depositInputValue}
            daiBalance={daiBalance}
            sDaiBalance={sDaiBalance}
            operationChange={operationChange}
            validationMessages={validationMessages}
            netValue={netValue}
            gasData={gasData}
            onCheckboxChange={() => {
              dsrDepositState.change({
                kind: 'isMintingSDai',
                isMintingSDai: !dsrDepositState.isMintingSDai,
              })
            }}
            isMintingSDai={dsrDepositState.isMintingSDai}
          />
        )}
        {[
          'depositWaiting4Approval',
          'depositInProgress',
          'depositSuccess',
          'withdrawWaiting4Approval',
          'withdrawInProgress',
          'withdrawSuccess',
          'allowanceSuccess',
          'allowanceWaitingForApproval',
          'allowanceInProgress',
          'proxyInProgress',
          'proxyWaitingForApproval',
          'proxySuccess',
        ].includes(stage) && <DsrSidebarCreation state={dsrDepositState} />}
      </Grid>
    ),
    primaryButton: {
      label: t(primaryButtonlabel),
      action: () => onPrimaryButtonClick && onPrimaryButtonClick(),
      isLoading,
      disabled: isDsrButtonDisabled({
        isOwner,
        stage,
        isLoading,
        depositInputValue,
        withDrawInputValue,
        selectedAllowanceRadio,
        validationMessages,
        allowanceAmount,
      }),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

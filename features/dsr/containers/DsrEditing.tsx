import type BigNumber from 'bignumber.js'
import { ActionPills } from 'components/ActionPills'
import { MessageCard } from 'components/MessageCard'
import { DsrConvertDaiForm } from 'features/dsr/components/DsrConvertDaiForm'
import { DsrDepositDaiFrom } from 'features/dsr/components/DsrDepositDaiForm'
import { DsrWithdrawDaiForm } from 'features/dsr/components/DsrWithdrawDaiForm'
import type { DsrDepositStage, DsrSidebarTabOptions } from 'features/dsr/helpers/dsrDeposit.types'
import type { DsrWithdrawStage } from 'features/dsr/pipes/dsrWithdraw'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { ChangeEvent } from 'react'
import React, { useMemo } from 'react'
import { OpenVaultAnimation } from 'theme/animations'
import { Box, Flex, Image } from 'theme-ui'

interface DsrEditingProps {
  activeTab: DsrSidebarTabOptions
  daiBalance: BigNumber
  sDaiBalance: BigNumber
  onDepositAmountChange: (e: ChangeEvent<HTMLInputElement>) => void
  depositInputValue?: BigNumber
  onPrimaryButtonClick?: () => void
  stage: DsrDepositStage | DsrWithdrawStage
  isLoading: boolean
  operationChange: (operation: DsrSidebarTabOptions) => void
  validationMessages: string[]
  netValue: BigNumber
  gasData: HasGasEstimation
  onCheckboxChange: () => void
  isMintingSDai: boolean
}

export function DsrEditing({
  isLoading,
  activeTab,
  stage,
  onDepositAmountChange,
  depositInputValue,
  daiBalance,
  sDaiBalance,
  operationChange,
  validationMessages,
  netValue,
  gasData,
  onCheckboxChange,
  isMintingSDai,
}: DsrEditingProps) {
  const { t } = useTranslation()

  const action = useMemo(() => {
    return activeTab === 'deposit' ? 'Deposit' : 'Withdraw'
  }, [activeTab])

  return (
    <>
      {isLoading && (
        <Flex
          sx={{
            justifyContent: 'center',
          }}
        >
          <OpenVaultAnimation />
        </Flex>
      )}
      {!isLoading && ['depositSuccess', 'withdrawSuccess'].includes(stage) && (
        <Box>
          <Flex sx={{ justifyContent: 'center', mb: 4 }}>
            <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
          </Flex>
        </Box>
      )}
      {!isLoading && !['depositSuccess', 'withdrawSuccess'].includes(stage) && (
        <>
          {netValue.gt(zero) && (
            <ActionPills
              active={activeTab}
              items={[
                {
                  id: 'deposit',
                  label: t('dsr.labels.deposit'),
                  action: () => {
                    operationChange('deposit')
                  },
                },
                {
                  id: 'withdraw',
                  label: t('dsr.labels.withdraw'),
                  action: () => {
                    operationChange('withdraw')
                  },
                  disabled: netValue.isZero(),
                },
                {
                  id: 'convert',
                  label: t('dsr.labels.convert'),
                  action: () => {
                    operationChange('convert')
                  },
                },
              ]}
            />
          )}
          {netValue.isZero() && (
            <ActionPills
              active={activeTab}
              items={[
                {
                  id: 'deposit',
                  label: t('dsr.labels.deposit'),
                  action: () => {
                    operationChange('deposit')
                  },
                },
                {
                  id: 'convert',
                  label: t('dsr.labels.convert'),
                  action: () => {
                    operationChange('convert')
                  },
                },
              ]}
            />
          )}
          {activeTab === 'deposit' && (
            <DsrDepositDaiFrom
              action={action}
              onDepositAmountChange={onDepositAmountChange}
              amount={depositInputValue}
              maxAmount={daiBalance}
              activeTab={activeTab}
              gasData={gasData}
              onCheckboxChange={onCheckboxChange}
              isMintingSDai={isMintingSDai}
            />
          )}
          {activeTab === 'withdraw' && (
            <DsrWithdrawDaiForm
              action={action}
              onDepositAmountChange={onDepositAmountChange}
              amount={depositInputValue}
              maxAmount={netValue}
              activeTab={activeTab}
              gasData={gasData}
            />
          )}
          {activeTab === 'convert' && (
            <DsrConvertDaiForm
              action={action}
              onDepositAmountChange={onDepositAmountChange}
              amount={depositInputValue}
              maxAmount={sDaiBalance}
              activeTab={activeTab}
              gasData={gasData}
            />
          )}
          {!!validationMessages.length && (
            <MessageCard
              type="error"
              messages={validationMessages.map((message) =>
                t(`dsr.errors.${message}`, { totalValue: netValue.toFixed(2) }),
              )}
              withBullet={false}
            />
          )}
        </>
      )}
    </>
  )
}

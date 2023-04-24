import BigNumber from 'bignumber.js'
import { ActionPills } from 'components/ActionPills'
import { MessageCard } from 'components/MessageCard'
import { DsrDepositDaiFrom } from 'features/dsr/components/DsrDepositDaiForm'
import { DsrDepositStage } from 'features/dsr/helpers/dsrDeposit'
import { DsrWithdrawStage } from 'features/dsr/pipes/dsrWithdraw'
import { DsrSidebarTabOptions } from 'features/dsr/sidebar/DsrSideBar'
import { HasGasEstimation } from 'helpers/form'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { ChangeEvent, useMemo } from 'react'
import { Box, Flex, Image } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

interface DsrEditingProps {
  activeTab: DsrSidebarTabOptions
  daiBalance: BigNumber
  onDepositAmountChange: (e: ChangeEvent<HTMLInputElement>) => void
  depositInputValue?: BigNumber
  onPrimaryButtonClick?: () => void
  stage: DsrDepositStage | DsrWithdrawStage
  isLoading: boolean
  operationChange: (operation: DsrSidebarTabOptions) => void
  validationMessages: string[]
  netValue: BigNumber
  gasData: HasGasEstimation
}

export function DsrEditing({
  isLoading,
  activeTab,
  stage,
  onDepositAmountChange,
  depositInputValue,
  daiBalance,
  operationChange,
  validationMessages,
  netValue,
  gasData,
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
              ]}
            />
          )}
          <DsrDepositDaiFrom
            action={action}
            onDepositAmountChange={onDepositAmountChange}
            amount={depositInputValue}
            maxAmount={activeTab === 'deposit' ? daiBalance : netValue}
            activeTab={activeTab}
            gasData={gasData}
          />
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

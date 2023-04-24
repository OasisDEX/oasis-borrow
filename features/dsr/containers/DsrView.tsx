import { BigNumber } from 'bignumber.js'
import { Context } from 'blockchain/network'
import { TabBar } from 'components/TabBar'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { DsrFaq } from 'features/content/faqs/dsr'
import { DsrDetailsSection } from 'features/dsr/components/DsrDetailsSection'
import { DsrHistory } from 'features/dsr/containers/DsrHistory'
import { DsrDepositState } from 'features/dsr/helpers/dsrDeposit'
import { DsrPot } from 'features/dsr/helpers/dsrPot'
import { DsrSideBar } from 'features/dsr/sidebar/DsrSideBar'
import { handleAmountChange } from 'features/dsr/utils/formUtils'
import { selectPrimaryAction } from 'features/dsr/utils/helpers'
import { VaultOwnershipBanner } from 'features/notices/VaultsNoticesView'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { Loadable } from 'helpers/loadable'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Grid } from 'theme-ui'

interface DsrViewProps {
  dsrOverview: Loadable<DsrPot>
  dsrDepositState: DsrDepositState
  walletAddress: string
  context: Context
  potTotalValueLocked?: BigNumber
  apy: BigNumber
}

const isLoadingCollection = [
  'depositInProgress',
  'withdrawInProgress',
  'allowanceInProgress',
  'allowanceWaitingForApproval',
  'proxyInProgress',
  'proxyWaitingForApproval',
  'depositWaiting4Approval',
  'withdrawWaiting4Approval',
]

export function DsrView({
  dsrDepositState,
  dsrOverview,
  walletAddress,
  context,
  potTotalValueLocked,
  apy,
}: DsrViewProps) {
  const { t } = useTranslation()
  const isLoading = isLoadingCollection.includes(dsrDepositState.stage)

  const account = context.status === 'connected' ? context.account : undefined
  const isOwner = walletAddress === account
  const earnings =
    dsrOverview.value && 'earnings' in dsrOverview.value ? dsrOverview.value.earnings : zero
  const netValue = dsrDepositState.netValue || zero

  return (
    <>
      {!isOwner && (
        <Box mb={4}>
          <VaultOwnershipBanner account={account} controller={walletAddress} />
        </Box>
      )}
      <VaultHeadline
        header={t('dsr.titles.heading')}
        token={['DAI']}
        details={[
          {
            label: t('dsr.details.current-yield'),
            value: formatPercent(apy, { precision: 2 }),
          },
          {
            label: t('earn-vault.headlines.total-value-locked'),
            value: potTotalValueLocked ? formatCryptoBalance(potTotalValueLocked) : 'n/a',
          },
        ]}
        shareButton={netValue.gt(zero)}
      />
      <TabBar
        variant="underline"
        sections={[
          {
            value: 'overview',
            label: t('dsr.details.overview'),
            content: (
              <Grid variant="vaultContainer">
                <Box>
                  <DsrDetailsSection
                    apy={apy}
                    depositAmount={dsrDepositState.amount}
                    netValue={netValue}
                    earnings={earnings}
                  />
                </Box>
                <Box>
                  <DsrSideBar
                    activeTab={dsrDepositState.operation}
                    daiBalance={dsrDepositState.daiBalance}
                    onDepositAmountChange={handleAmountChange(dsrDepositState.change!)}
                    depositInputValue={dsrDepositState.amount}
                    withDrawInputValue={dsrDepositState.amount}
                    onPrimaryButtonClick={selectPrimaryAction(
                      dsrDepositState.stage,
                      dsrDepositState.operation,
                      dsrDepositState,
                    )}
                    stage={dsrDepositState.stage}
                    isLoading={isLoading}
                    proxyAddress={dsrDepositState.proxyAddress}
                    daiAllowance={dsrDepositState.allowance}
                    isOwner={isOwner}
                    operationChange={dsrDepositState.operationChange}
                    netValue={netValue}
                    gasData={{
                      gasEstimation: dsrDepositState.gasEstimation,
                      gasEstimationUsd: dsrDepositState.gasEstimationUsd,
                      gasEstimationStatus: dsrDepositState.gasEstimationStatus,
                    }}
                    validationMessages={dsrDepositState.messages
                      .map((message) => message.kind)
                      .filter((item) => item !== 'amountIsEmpty')}
                    selectedAllowanceRadio={dsrDepositState.selectedAllowanceRadio}
                    dsrDepositState={dsrDepositState}
                    allowanceAmount={dsrDepositState.allowanceAmount}
                  />
                </Box>
              </Grid>
            ),
          },
          {
            value: 'position-info',
            label: t('system.faq'),
            content: (
              <Card variant="faq">
                {/* TODO: Chris to add the DSR Faq */}
                <DsrFaq />
              </Card>
            ),
          },
          ...(dsrOverview.value &&
          'history' in dsrOverview.value &&
          !!dsrOverview.value.history.length
            ? [
                {
                  label: t('system.history'),
                  value: VaultViewMode.History,
                  content: <DsrHistory history={dsrOverview.value.history} />,
                },
              ]
            : ([] as any)),
        ]}
      />
    </>
  )
}

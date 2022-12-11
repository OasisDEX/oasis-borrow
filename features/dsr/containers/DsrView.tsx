import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { TabBar } from 'components/TabBar'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { AaveFaq } from 'features/content/faqs/aave'
import { DsrHistory } from 'features/dsr/containers/DsrHistory'
import { selectPrimaryAction } from 'features/dsr/utils/helpers'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { Loadable } from 'helpers/loadable'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import { useMemo } from 'react'
import React from 'react'
import { Box, Card, Grid } from 'theme-ui'

import { DsrDetailsSection } from '../components/DsrDetailsSection'
import { DsrDepositState } from '../helpers/dsrDeposit'
import { DsrPot } from '../helpers/dsrPot'
import { DsrSideBar } from '../sidebar/DsrSideBar'
import { handleAmountChange } from '../utils/formUtils'

interface DsrViewProps {
  dsrOverview: Loadable<DsrPot>
  dsrDepositState: DsrDepositState
  walletAddress: string
  context: Context
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

export function DsrView({ dsrDepositState, dsrOverview, walletAddress, context }: DsrViewProps) {
  const { t } = useTranslation()
  const isLoading = isLoadingCollection.includes(dsrDepositState.stage)

  const currentApy = useMemo(() => {
    return formatPercent(dsrOverview.value?.apy || new BigNumber(0), { precision: 2 })
  }, [dsrOverview])

  // console.log('dsrOverview', dsrOverview)
  console.log('dsr', dsrDepositState)
  // console.log('walletAddress', walletAddress)

  const isOwner = context.status === 'connected' && walletAddress === context.account
  const earnings =
    dsrOverview.value && 'earnings' in dsrOverview.value ? dsrOverview.value.earnings : zero

  const netValue = (dsrDepositState.daiDeposit || zero).plus(earnings)

  return (
    <>
      <VaultHeadline
        header={t('dsr.titles.heading')}
        token={['DAI']}
        details={[
          {
            label: t('dsr.details.current-yield'),
            value: currentApy,
          },
          ...(dsrDepositState.daiDeposit?.gt(zero)
            ? [
                {
                  label: t('earn-vault.headlines.total-value-locked'),
                  value: `$${formatAmount(netValue, 'USD')}`,
                },
              ]
            : []),
        ]}
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
                    totalDepositedDai={dsrDepositState.daiDeposit}
                    currentApy={dsrOverview.value?.apy || new BigNumber(0)}
                    depositAmount={dsrDepositState.amount}
                    netValue={netValue}
                  />
                </Box>
                <Box>
                  <DsrSideBar
                    activeTab={dsrDepositState.operation}
                    daiBalance={dsrDepositState.daiBalance}
                    onDepositAmountChange={handleAmountChange(dsrDepositState.change!)}
                    depositInputValue={dsrDepositState.amount}
                    withDrawInputValue={dsrDepositState.amount}
                    daiBalanceInDsr={dsrDepositState.daiDeposit}
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
                <AaveFaq />
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

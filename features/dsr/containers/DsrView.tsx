import type { BigNumber } from 'bignumber.js'
import type { Context } from 'blockchain/network.types'
import { LazySummerBannerWithRaysHandling } from 'components/LazySummerBanner'
import { TabBar } from 'components/TabBar'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar.types'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { DsrFaq } from 'features/content/faqs/dsr'
import { DsrDetailsSection } from 'features/dsr/components/DsrDetailsSection'
import { DsrHistory } from 'features/dsr/containers/DsrHistory'
import type { DsrDepositState } from 'features/dsr/helpers/dsrDeposit.types'
import type { DsrPot } from 'features/dsr/helpers/dsrPot'
import { DsrSideBar } from 'features/dsr/sidebar/DsrSideBar'
import { handleAmountChange } from 'features/dsr/utils/formUtils'
import { selectPrimaryAction } from 'features/dsr/utils/helpers'
import { VaultOwnershipBanner } from 'features/notices/VaultsNoticesView'
import { UpgradeToSkyBanner } from 'features/sky/components/UpgradeToSkyBanner'
import { useAppConfig } from 'helpers/config'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import type { Loadable } from 'helpers/loadable'
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
  dsr: BigNumber
  sdaiPrice: BigNumber
  daiPrice: BigNumber
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
  dsr,
  sdaiPrice,
  daiPrice,
}: DsrViewProps) {
  const { t } = useTranslation()
  const { SkyUpgrade } = useAppConfig('features')
  const isLoading = isLoadingCollection.includes(dsrDepositState.stage)

  const account = context.status === 'connected' ? context.account : undefined
  const isOwner = walletAddress.toLowerCase() === account?.toLowerCase()
  const earnings =
    dsrOverview.value && 'earnings' in dsrOverview.value ? dsrOverview.value.earnings : zero
  const netValue = dsrDepositState.netValue || zero

  return (
    <>
      {account && <LazySummerBannerWithRaysHandling isOwner={isOwner} address={account} />}
      {!isOwner && (
        <Box mb={4}>
          <VaultOwnershipBanner account={account} controller={walletAddress} />
        </Box>
      )}
      {isOwner && SkyUpgrade && <UpgradeToSkyBanner />}
      <VaultHeadline
        header={t('dsr.titles.heading')}
        tokens={['DAI']}
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
                    dsr={dsr}
                    depositAmount={dsrDepositState.amount}
                    sDaiBalance={dsrDepositState.sDaiBalance}
                    netValue={netValue}
                    earnings={earnings}
                    operation={dsrDepositState.operation}
                    isMintingSDai={dsrDepositState.isMintingSDai}
                    sdaiPrice={sdaiPrice}
                    daiPrice={daiPrice}
                  />
                </Box>
                <Box>
                  <DsrSideBar
                    activeTab={dsrDepositState.operation}
                    daiBalance={dsrDepositState.daiBalance}
                    sDaiBalance={dsrDepositState.sDaiBalance}
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
                    daiWalletAllowance={dsrDepositState.daiWalletAllowance}
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

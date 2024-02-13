import BigNumber from 'bignumber.js'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar.types'
import { LTVWarningThreshold } from 'features/omni-kit/protocols/ajna/constants'
import { AppSpinner } from 'helpers/AppSpinner'
import { formatDecimalAsPercent, formatPercent } from 'helpers/formatters/format'
import { useModal } from 'helpers/modalHook'
import { useHash } from 'helpers/useHash'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { theme } from 'theme'
import { Card, Grid, Heading, Text } from 'theme-ui'

const { colors } = theme

const getLTVRatioColor = (ratio: BigNumber) => {
  const critical = new BigNumber(5)
  const warning = new BigNumber(20)

  switch (true) {
    case ratio.isLessThanOrEqualTo(critical):
      return colors?.critical10
    case ratio.isLessThanOrEqualTo(warning):
      return colors?.warning10
    default:
      return colors?.success10
  }
}

interface ContentCardLtvModalProps {
  loanToValue: BigNumber
  liquidationThreshold: BigNumber
  maxLoanToValue?: BigNumber
  isAutomationAvailable?: boolean
  stopLossLevel?: BigNumber
  isStopLossEnabled?: boolean
  isAutomationDataLoaded?: boolean
}

function ContentCardLtvModal({
  loanToValue,
  liquidationThreshold,
  maxLoanToValue,
  isAutomationAvailable,
  isStopLossEnabled,
  isAutomationDataLoaded,
  stopLossLevel,
}: ContentCardLtvModalProps) {
  const { close: closeModal } = useModal()
  const { t } = useTranslation()
  const [, setHash] = useHash()
  const usableStopLossLevel = isStopLossEnabled ? stopLossLevel : undefined
  const stopLossLevelLoading = !isAutomationDataLoaded

  const goToProtection = () => {
    closeModal!()
    setHash(VaultViewMode.Protection)
  }

  return (
    <Grid gap={2}>
      <Heading variant="header4">{t('aave-position-modal.ltv.first-header')}</Heading>
      <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
        {t('aave-position-modal.ltv.first-description-line')}
      </Text>
      <Card as="p" variant="vaultDetailsCardModal">
        {formatDecimalAsPercent(loanToValue)}
      </Card>
      {maxLoanToValue && (
        <>
          <Heading variant="header4">{t('aave-position-modal.ltv.second-header')}</Heading>
          <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
            {t('aave-position-modal.ltv.second-description-line')}
          </Text>
          <Card as="p" variant="vaultDetailsCardModal">
            {formatDecimalAsPercent(maxLoanToValue)}
          </Card>
        </>
      )}
      <Heading variant="header4">{t('aave-position-modal.ltv.third-header')}</Heading>
      <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
        {t('aave-position-modal.ltv.third-description-line')}
      </Text>
      <Card as="p" variant="vaultDetailsCardModal">
        {formatDecimalAsPercent(liquidationThreshold)}
      </Card>
      {isAutomationAvailable && (
        <>
          <Heading variant="header4">{t('aave-position-modal.ltv.fourth-header')}</Heading>
          <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
            <Trans
              i18nKey="aave-position-modal.ltv.fourth-description-line"
              components={[
                <Text
                  key="goToProtection"
                  as="span"
                  variant="boldParagraph3"
                  onClick={goToProtection}
                  sx={{ cursor: 'pointer' }}
                />,
              ]}
            />
          </Text>
          <Card as="p" variant="vaultDetailsCardModal">
            {usableStopLossLevel ? (
              formatDecimalAsPercent(usableStopLossLevel)
            ) : (
              <Text
                as="p"
                variant="paragraph3"
                onClick={!stopLossLevelLoading ? goToProtection : undefined}
                sx={!stopLossLevelLoading ? { cursor: 'pointer' } : {}}
              >
                {stopLossLevelLoading ? (
                  <AppSpinner />
                ) : (
                  t('aave-position-modal.ltv.stop-loss-not-set')
                )}
              </Text>
            )}
          </Card>
        </>
      )}
    </Grid>
  )
}

interface ContentCardLtvProps {
  loanToValue: BigNumber
  liquidationThreshold: BigNumber
  maxLoanToValue?: BigNumber
  afterLoanToValue?: BigNumber
  automation?: {
    isStopLossEnabled: boolean
    isAutomationDataLoaded: boolean
    isAutomationAvailable?: boolean
    stopLossLevel?: BigNumber
  }
}

export function ContentCardLtv({
  loanToValue,
  liquidationThreshold,
  afterLoanToValue,
  maxLoanToValue,
  automation,
}: ContentCardLtvProps) {
  const { t } = useTranslation()

  const { stopLossLevel, isStopLossEnabled, isAutomationDataLoaded, isAutomationAvailable } =
    automation ?? { isStopLossEnabled: false, isAutomationDataLoaded: false }

  const formatted = {
    loanToValue: formatDecimalAsPercent(loanToValue),
    afterLoanToValue: afterLoanToValue && formatDecimalAsPercent(afterLoanToValue),
    liquidationThreshold: formatPercent(liquidationThreshold.times(100)),
    stopLossLevel: stopLossLevel && formatPercent(stopLossLevel.times(100)),
  }

  const contentCardModalSettings: ContentCardLtvModalProps = {
    loanToValue,
    maxLoanToValue,
    liquidationThreshold,
    isAutomationAvailable,
    stopLossLevel,
    isStopLossEnabled,
    isAutomationDataLoaded,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('system.loan-to-value'),
    value: formatted.loanToValue,
    footnote:
      isAutomationAvailable && isStopLossEnabled && stopLossLevel
        ? t('manage-earn-vault.stop-loss-ltv', {
            percentage: formatted.stopLossLevel,
          })
        : t('manage-earn-vault.liquidation-threshold', {
            percentage: formatted.liquidationThreshold,
          }),
    customBackground:
      afterLoanToValue && !liquidationThreshold.eq(zero)
        ? getLTVRatioColor(liquidationThreshold.minus(loanToValue).times(100))
        : 'transparent',
    modal: <ContentCardLtvModal {...contentCardModalSettings} />,
  }

  if (afterLoanToValue && maxLoanToValue) {
    contentCardSettings.change = {
      variant: maxLoanToValue.minus(afterLoanToValue).gt(LTVWarningThreshold)
        ? 'positive'
        : 'negative',
      value: `${formatted.afterLoanToValue} ${t('after')}`,
    }
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}

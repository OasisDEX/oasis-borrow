import BigNumber from 'bignumber.js'
import { ContentCardProps, DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatDecimalAsPercent, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { theme } from 'theme'
import { Card, Grid, Heading, Text } from 'theme-ui'

const { colors } = theme

const getLTVRatioColor = (ratio: BigNumber) => {
  const critical = new BigNumber(5)
  const warning = new BigNumber(20)

  switch (true) {
    case ratio.isLessThanOrEqualTo(critical):
      return colors.critical10
    case ratio.isLessThanOrEqualTo(warning):
      return colors.warning10
    default:
      return colors.success10
  }
}

interface ContentCardLtvModalProps {
  loanToValue: BigNumber
  liquidationThreshold: BigNumber
  maxLoanToValue?: BigNumber
}

function ContentCardLtvModal({
  loanToValue,
  liquidationThreshold,
  maxLoanToValue,
}: ContentCardLtvModalProps) {
  const { t } = useTranslation()

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
    </Grid>
  )
}

interface ContentCardLtvProps {
  loanToValue: BigNumber
  liquidationThreshold: BigNumber
  maxLoanToValue?: BigNumber
  afterLoanToValue?: BigNumber
}

export function ContentCardLtv({
  loanToValue,
  liquidationThreshold,
  afterLoanToValue,
  maxLoanToValue,
}: ContentCardLtvProps) {
  const { t } = useTranslation()

  const formatted = {
    loanToValue: formatDecimalAsPercent(loanToValue),
    afterLoanToValue: afterLoanToValue && formatDecimalAsPercent(afterLoanToValue),
    liquidationThreshold: formatPercent(liquidationThreshold.times(100)),
  }

  const contentCardModalSettings: ContentCardLtvModalProps = {
    loanToValue,
    maxLoanToValue,
    liquidationThreshold,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('system.loan-to-value'),
    value: formatted.loanToValue,
    footnote: `${t('manage-earn-vault.liquidation-threshold', {
      percentage: formatted.liquidationThreshold,
    })}`,
    customBackground:
      afterLoanToValue && !liquidationThreshold.eq(zero)
        ? getLTVRatioColor(liquidationThreshold.minus(loanToValue).times(100))
        : 'transparent',
    modal: <ContentCardLtvModal {...contentCardModalSettings} />,
  }

  if (afterLoanToValue) {
    contentCardSettings.change = {
      variant: afterLoanToValue.lt(loanToValue) ? 'negative' : 'positive',
      value: `${formatted.afterLoanToValue} ${t('after')}`,
    }
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}

import type BigNumber from 'bignumber.js'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardCommonProps } from 'features/omni-kit/components/details-section/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Heading, Text } from 'theme-ui'

interface AjnaContentCardLoanToValueModalProps {
  dynamicMaxLtv?: string
  loanToValue: string
}

interface AjnaContentCardLoanToValueProps extends OmniContentCardCommonProps {
  afterLoanToValue?: BigNumber
  dynamicMaxLtv?: BigNumber
  loanToValue: BigNumber
}

function AjnaContentCardLoanToValueModal({
  dynamicMaxLtv,
  loanToValue,
}: AjnaContentCardLoanToValueModalProps) {
  const { t } = useTranslation()

  return (
    <>
      <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
        {t('ajna.position-page.borrow.common.overview.loan-to-value-modal-desc')}
      </Text>
      <Card variant="vaultDetailsCardModal" sx={{ my: 2 }}>
        {loanToValue}
      </Card>
      {dynamicMaxLtv && (
        <>
          <Heading variant="header5" sx={{ fontWeight: 'bold' }}>
            {t('ajna.position-page.borrow.common.overview.dynamic-max-ltv')}
          </Heading>
          <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
            {t('ajna.position-page.borrow.common.overview.dynamic-max-ltv-modal-desc')}
          </Text>
          <Card variant="vaultDetailsCardModal" sx={{ mt: 2 }}>
            {dynamicMaxLtv}
          </Card>
        </>
      )}
    </>
  )
}

export function AjnaContentCardLoanToValue({
  afterLoanToValue,
  changeVariant,
  dynamicMaxLtv,
  isLoading,
  loanToValue,
  modalTheme,
}: AjnaContentCardLoanToValueProps) {
  const { t } = useTranslation()

  const formatted = {
    loanToValue: formatDecimalAsPercent(loanToValue),
    afterLoanToValue: afterLoanToValue && formatDecimalAsPercent(afterLoanToValue),
    dynamicMaxLtv: dynamicMaxLtv && formatDecimalAsPercent(dynamicMaxLtv),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.borrow.common.overview.loan-to-value'),
    value: `${formatted.loanToValue}`,
    change: {
      isLoading,
      value: afterLoanToValue && `${formatted.afterLoanToValue} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    footnote:
      dynamicMaxLtv &&
      `${t('ajna.position-page.borrow.common.overview.dynamic-max-ltv')}: ${
        formatted.dynamicMaxLtv
      }`,
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('ajna.position-page.borrow.common.overview.loan-to-value')}
        theme={modalTheme}
      >
        <AjnaContentCardLoanToValueModal
          loanToValue={formatted.loanToValue}
          dynamicMaxLtv={formatted.dynamicMaxLtv}
        />
      </DetailsSectionContentSimpleModal>
    ),
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}

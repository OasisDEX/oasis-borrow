import type BigNumber from 'bignumber.js'
import type { ChangeVariantType, ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Heading, Text } from 'theme-ui'

interface ContentCardLoanToValueModalProps {
  loanToValue: string
  dynamicMaxLtv?: string
}

interface ContentCardLoanToValueProps {
  isLoading?: boolean
  loanToValue: BigNumber
  afterLoanToValue?: BigNumber
  dynamicMaxLtv?: BigNumber
  changeVariant?: ChangeVariantType
}

function ContentCardLoanToValueModal({
  loanToValue,
  dynamicMaxLtv,
}: ContentCardLoanToValueModalProps) {
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

export function ContentCardLoanToValue({
  isLoading,
  loanToValue,
  afterLoanToValue,
  dynamicMaxLtv,
  changeVariant = 'positive',
}: ContentCardLoanToValueProps) {
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
      <AjnaDetailsSectionContentSimpleModal
        title={t('ajna.position-page.borrow.common.overview.loan-to-value')}
      >
        <ContentCardLoanToValueModal
          loanToValue={formatted.loanToValue}
          dynamicMaxLtv={formatted.dynamicMaxLtv}
        />
      </AjnaDetailsSectionContentSimpleModal>
    ),
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}

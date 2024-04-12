import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { RefinanceValidationMessages } from 'features/refinance/components/RefinanceValidationMessages'
import { RefinanceHighlightedChangeSection } from 'features/refinance/components/steps/RefinanceHighlightedChangeSection'
import { RefinanceReviewChangesSection } from 'features/refinance/components/steps/RefinanceReviewChangesSection'
import { RefinanceRouteSection } from 'features/refinance/components/steps/RefinanceRouteSection'
import { RefinanceSwapSection } from 'features/refinance/components/steps/RefinanceSwapSection'
import { useRefinanceContext } from 'features/refinance/contexts'
import { formatFiatBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

export const RefinanceWhatsChangingStep = () => {
  const { t } = useTranslation()

  const {
    metadata: {
      validations: { errors, warnings, notices, successes },
    },
  } = useRefinanceContext()

  const summerFee = new BigNumber(100)

  const formatted = {
    summerFee: `$${formatFiatBalance(summerFee)}`,
  }

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('refinance.sidebar.whats-changing.description')}
      </Text>
      <RefinanceHighlightedChangeSection />
      <RefinanceReviewChangesSection />
      <RefinanceSwapSection />
      <RefinanceRouteSection />
      <RefinanceValidationMessages validations={errors} type="error" />
      <RefinanceValidationMessages validations={warnings} type="warning" />
      <RefinanceValidationMessages validations={notices} type="notice" />
      <RefinanceValidationMessages validations={successes} type="success" />
      <InfoSection
        items={[
          {
            label: t('refinance.sidebar.whats-changing.summerfi-fee'),
            value: formatted.summerFee,
            tooltip: 'TBD',
          },
        ]}
      />
    </>
  )
}

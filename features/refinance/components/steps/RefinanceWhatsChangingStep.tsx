import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { RefinanceReviewChangesSection } from 'features/refinance/components/steps/RefinanceReviewChangesSection'
import { RefinanceRouteSection } from 'features/refinance/components/steps/RefinanceRouteSection'
import { RefinanceSwapSection } from 'features/refinance/components/steps/RefinanceSwapSection'
import { formatFiatBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'
import { RefinanceHighlightedChangeSection } from 'features/refinance/components/steps/RefinanceHighlightedChangeSection'

export const RefinanceWhatsChangingStep = () => {
  const { t } = useTranslation()

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

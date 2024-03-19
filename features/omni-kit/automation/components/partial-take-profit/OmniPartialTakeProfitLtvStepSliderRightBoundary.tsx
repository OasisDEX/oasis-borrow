import type BigNumber from 'bignumber.js'
import { FormatPercentWithSmallPercentCharacter } from 'components/FormatPercentWithSmallPercentCharacter'
import { lambdaPercentageDenomination } from 'features/aave/constants'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Flex, Text } from 'theme-ui'

interface OmniPartialTakeProfitSliderRightBoundaryProps {
  value: BigNumber
}

export const OmniPartialTakeProfitLtvStepSliderRightBoundary: FC<
  OmniPartialTakeProfitSliderRightBoundaryProps
> = ({ value }) => {
  const { t } = useTranslation()

  if (value.isZero()) {
    return <>-</>
  }
  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Text variant="paragraph3" sx={{ mb: 2 }}>
        {' ' /** empty space so the lines match with the left boundary formatter */}
      </Text>
      <Text variant="paragraph2">
        <Text as="span" variant="paragraph4" sx={{ mr: 1, color: 'neutral80' }}>
          {t('protection.partial-take-profit-sidebar.ltv-after-execution')}
        </Text>
        <FormatPercentWithSmallPercentCharacter value={value.div(lambdaPercentageDenomination)} />
      </Text>
    </Flex>
  )
}

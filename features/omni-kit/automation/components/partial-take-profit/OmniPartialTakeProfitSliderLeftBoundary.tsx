import type BigNumber from 'bignumber.js'
import { FormatPercentWithSmallPercentCharacter } from 'components/FormatPercentWithSmallPercentCharacter'
import { Icon } from 'components/Icon'
import { StatefulTooltip } from 'components/Tooltip'
import { lambdaPercentageDenomination } from 'features/aave/constants'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { question_o } from 'theme/icons'
import { Flex, Text } from 'theme-ui'

interface OmniPartialTakeProfitSliderLeftBoundaryProps {
  value: BigNumber
}

export const OmniPartialTakeProfitSliderLeftBoundary: FC<
  OmniPartialTakeProfitSliderLeftBoundaryProps
> = ({ value }) => {
  const { t } = useTranslation()

  if (value.isZero()) {
    return <>-</>
  }
  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Text variant="paragraph3" sx={{ mb: 2 }}>
        {t('protection.partial-take-profit-sidebar.ltv-withdrawal-step')}
        <StatefulTooltip
          tooltip={
            <Text variant="paragraph4">
              {t('protection.partial-take-profit-sidebar.tooltips.withdrawal-step')}
            </Text>
          }
          containerSx={{ display: 'inline', zIndex: 10, position: 'relative' }}
          inline
          tooltipSx={{ width: '350px' }}
        >
          <Icon
            color={'neutral80'}
            icon={question_o}
            size="auto"
            width="14px"
            height="14px"
            sx={{ position: 'relative', top: '2px', ml: 1, transition: 'color 200ms' }}
          />
        </StatefulTooltip>
      </Text>
      <Text variant="paragraph2">
        <FormatPercentWithSmallPercentCharacter value={value.div(lambdaPercentageDenomination)} />
        <Text as="span" variant="paragraph4" sx={{ ml: 1, color: 'neutral80' }}>
          {t('protection.partial-take-profit-sidebar.step-amount')}
        </Text>
      </Text>
    </Flex>
  )
}

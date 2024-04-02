import { AppLink } from 'components/Links'
import { useRefinanceContext } from 'features/refinance/RefinanceContext'
import { RefinanceOptions } from 'features/refinance/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Text } from 'theme-ui'

const options = [
  {
    label: 'refinance.sidebar.why-refinance.list.item-1',
    value: RefinanceOptions.HIGHER_LTV,
  },
  {
    label: 'refinance.sidebar.why-refinance.list.item-2',
    value: RefinanceOptions.LOWER_COST,
  },
  {
    label: 'refinance.sidebar.why-refinance.list.item-3',
    value: RefinanceOptions.CHANGE_DIRECTION,
  },
  {
    label: 'refinance.sidebar.why-refinance.list.item-4',
    value: RefinanceOptions.SWITCH_TO_EARN,
  },
]

export const RefinanceStrategyStep = () => {
  const { t } = useTranslation()
  const {
    form: { updateState },
    steps: { setNextStep },
  } = useRefinanceContext()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        <Trans
          i18nKey="refinance.sidebar.why-refinance.description"
          shouldUnescape
          components={{
            1: (
              <AppLink
                sx={{ fontSize: 'inherit', color: 'interactive100' }}
                href={EXTERNAL_LINKS.KB.HELP}
              />
            ),
          }}
        />
      </Text>
      <Text as="h3" sx={{ fontWeight: 'semiBold', fontSize: 3 }}>
        {t('refinance.sidebar.why-refinance.list.title')}
      </Text>
      {options.map((item, i) => (
        <Button
          key={i}
          variant="unStyled"
          onClick={() => {
            updateState('refinanceOption', item.value)
            setNextStep()
          }}
          sx={{
            textAlign: 'left',
            px: '24px',
            py: 3,
            border: '1px solid',
            borderColor: 'neutral20',
            borderRadius: 'medium',
            cursor: 'pointer',
            fontWeight: 'semiBold',
            fontSize: 2,
            backgroundColor: 'unset',
            margin: 'unset',
            color: 'primary100',
          }}
        >
          {t(item.label)}
        </Button>
      ))}
    </>
  )
}

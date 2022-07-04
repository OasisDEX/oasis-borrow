import { ActionPills } from 'components/ActionPills'
import { Item } from 'components/infoSection/Item'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useState } from 'react'

export type MaxGasPriceValues = '100' | '300' | '500' | 'NO_LIMIT'

interface MaxGasPriceSectionProps {
  onChange: (item: MaxGasPriceValues) => void
  defaultValue?: MaxGasPriceValues
}

export function MaxGasPriceSection({ onChange, defaultValue = '100' }: MaxGasPriceSectionProps) {
  const { t } = useTranslation()
  const [active, setActiveItem] = useState<MaxGasPriceValues>(defaultValue)

  const handleChange = useCallback(
    (item: MaxGasPriceValues) => {
      setActiveItem(item)
      onChange(item)
    },
    [onChange],
  )

  return (
    <Item
      label={t('basic-buy-sell-generic.max-gas-fee-trans-value')}
      labelColorPrimary
      dropDownElementType="element"
      subLabel={t('basic-buy-sell-generic.max-gas-fee-trans-subheading')}
      dropdownValues={[
        {
          value: (
            <>
              <ActionPills
                active={active}
                variant="secondary"
                items={[
                  {
                    id: '100',
                    label: '100 Gwei',
                    action: () => {
                      handleChange('100')
                    },
                  },
                  {
                    id: '300',
                    label: '300 Gwei',
                    action: () => {
                      handleChange('300')
                    },
                  },
                  {
                    id: '500',
                    label: '500 Gwei',
                    action: () => {
                      handleChange('500')
                    },
                  },
                  {
                    id: 'NO_LIMIT',
                    label: 'No Limit',
                    action: () => {
                      handleChange('NO_LIMIT')
                    },
                  },
                ]}
              />
            </>
          ),
        },
      ]}
    />
  )
}

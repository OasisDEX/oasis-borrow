import { ActionPills } from 'components/ActionPills'
import { Item } from 'components/infoSection/Item'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useState } from 'react'

export type MaxGasPriceValues = 'FIVE' | 'TEN' | 'TWELVE_POINT_FIVE' | 'NO_LIMIT'

interface MaxGasPriceSectionProps {
  onChange: (item: MaxGasPriceValues) => void
  defaultValue?: MaxGasPriceValues
}

export function MaxGasPriceSection({ onChange, defaultValue = 'FIVE' }: MaxGasPriceSectionProps) {
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
                    id: 'FIVE',
                    label: '5%',
                    action: () => {
                      handleChange('FIVE')
                    },
                  },
                  {
                    id: 'TEN',
                    label: '10%',
                    action: () => {
                      handleChange('TEN')
                    },
                  },
                  {
                    id: 'TWELVE_POINT_FIVE',
                    label: '12.5%',
                    action: () => {
                      handleChange('TWELVE_POINT_FIVE')
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

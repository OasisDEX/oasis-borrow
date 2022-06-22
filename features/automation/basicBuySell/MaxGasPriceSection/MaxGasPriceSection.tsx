import { ActionPills } from 'components/ActionPills'
import { Item } from 'components/infoSection/Item'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

export type GAS_PERCENTAGE_TYPES = 'FIVE' | 'TEN' | 'TWELVE_POINT_FIVE' | 'NO_LIMIT'

// Future TODO: Will need to add the correct props to the component.
export function MaxGasPriceSection() {
  const { t } = useTranslation()
  const [active, setActiveItem] = useState('FIVE' as GAS_PERCENTAGE_TYPES)

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
                      setActiveItem('FIVE')
                    },
                  },
                  {
                    id: 'TEN',
                    label: '10%',
                    action: () => {
                      setActiveItem('TEN')
                    },
                  },
                  {
                    id: 'TWELVE_POINT_FIVE',
                    label: '12.5%',
                    action: () => {
                      setActiveItem('TWELVE_POINT_FIVE')
                    },
                  },
                  {
                    id: 'NO_LIMIT',
                    label: 'No Limit',
                    action: () => {
                      setActiveItem('NO_LIMIT')
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

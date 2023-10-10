import { trackingEvents } from 'analytics/trackingEvents'
import { MixpanelAutomationEventIds, MixpanelCommonAnalyticsSections } from 'analytics/types'
import { ActionPills } from 'components/ActionPills'
import { Item } from 'components/infoSection/Item'
import { maxUint32 } from 'features/automation/common/consts'
import { useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'

import type { MaxGasPriceSectionProps } from './MaxGasPriceSection.types'

export function MaxGasPriceSection({ onChange, value, analytics }: MaxGasPriceSectionProps) {
  const { t } = useTranslation()

  const handleChange = useCallback(
    (item: number) => {
      onChange(item)

      trackingEvents.automation.buttonClick(
        MixpanelAutomationEventIds.MaxGasFee,
        analytics.page,
        MixpanelCommonAnalyticsSections.Form,
        {
          ...analytics.additionalParams,
          maxGasFee: item.toString(),
        },
      )
    },
    [onChange],
  )

  return (
    <Item
      label={t('basic-buy-sell-generic.max-gas-fee-trans-value')}
      labelColorPrimary
      dropDownElementType="element"
      isHeading
      subLabel={t('basic-buy-sell-generic.max-gas-fee-trans-subheading')}
      dropdownValues={[
        {
          value: (
            <>
              <ActionPills
                active={value.toString()}
                variant="secondary"
                items={[
                  {
                    id: '100',
                    label: '100 Gwei',
                    action: () => {
                      handleChange(100)
                    },
                  },
                  {
                    id: '300',
                    label: '300 Gwei',
                    action: () => {
                      handleChange(300)
                    },
                  },
                  {
                    id: '500',
                    label: '500 Gwei',
                    action: () => {
                      handleChange(500)
                    },
                  },
                  {
                    id: maxUint32.toString(),
                    label: 'No Limit',
                    action: () => {
                      handleChange(maxUint32.toNumber())
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

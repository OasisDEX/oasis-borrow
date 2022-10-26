import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

import { ConstantMultipleInfoSectionControl } from './ConstantMultipleInfoSectionControl'
import { ConstantMultipleInfoSectionControlProps } from './SidebarConstantMultipleEditingStage'

export function SidebarConstantMultipleAwaitingConfirmation({
  token,
  nextBuyPrice,
  nextSellPrice,
  collateralToBePurchased,
  collateralToBeSold,
  estimatedGasCostOnTrigger,
  estimatedBuyFee,
  estimatedSellFee,
  constantMultipleState,
}: ConstantMultipleInfoSectionControlProps) {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('protection.confirmation-text')}
      </Text>
      <ConstantMultipleInfoSectionControl
        token={token}
        nextBuyPrice={nextBuyPrice}
        nextSellPrice={nextSellPrice}
        collateralToBePurchased={collateralToBePurchased}
        collateralToBeSold={collateralToBeSold}
        estimatedGasCostOnTrigger={estimatedGasCostOnTrigger}
        estimatedBuyFee={estimatedBuyFee}
        estimatedSellFee={estimatedSellFee}
        constantMultipleState={constantMultipleState}
      />
    </>
  )
}

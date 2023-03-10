import { ActionPills } from 'components/ActionPills'
import { useTranslation } from 'next-i18next'
import React from 'react'

export interface PickCloseStateProps {
  collateralTokenSymbol: string
  isCollateralActive: boolean
  onClickHandler: (optionName: string) => void
}

export function PickCloseState({
  collateralTokenSymbol,
  isCollateralActive,
  onClickHandler,
}: PickCloseStateProps) {
  const { t } = useTranslation()

  return (
    <ActionPills
      active={isCollateralActive ? 'collateral' : 'dai'}
      items={[
        {
          id: 'collateral',
          label: t('close-to', { token: collateralTokenSymbol }),
          action: () => onClickHandler('collateral'),
        },
        {
          id: 'dai',
          label: t('close-to', { token: 'DAI' }),
          action: () => onClickHandler('dai'),
        },
      ]}
    />
  )
}

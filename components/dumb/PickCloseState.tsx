import { FixedSizeArray } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { ActionPills } from '../ActionPills'

export interface PickCloseStateProps {
  collateralTokenSymbol: string
  collateralTokenIconCircle: string
  optionNames: FixedSizeArray<string, 2>
  onclickHandler: (optionName: string) => void
  isCollateralActive: boolean
}

export function PickCloseState(props: PickCloseStateProps) {
  const { t } = useTranslation()

  const onClickHandler = (op: string) => {
    props.onclickHandler(op)
  }

  return (
    <ActionPills
      active={props.isCollateralActive ? 'collateral' : 'dai'}
      items={[
        {
          id: 'collateral',
          label: t('close-to', { token: props.collateralTokenSymbol }),
          action: () => {
            onClickHandler('collateral')
          },
        },
        {
          id: 'dai',
          label: t('close-to', { token: 'DAI' }),
          action: () => {
            onClickHandler('dai')
          },
        },
      ]}
    />
  )
}

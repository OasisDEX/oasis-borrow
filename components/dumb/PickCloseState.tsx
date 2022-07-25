import { FixedSizeArray } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
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
  // eslint-disable-next-line
  const [isActive, setIsActive] = useState(props.isCollateralActive)
  const [option, setOption] = useState(props.isCollateralActive ? 'collateral' : 'dai')
  const { t } = useTranslation()

  const onClickHandler = (op: string) => {
    setIsActive(op === props.optionNames[0])
    setOption(op)
    props.onclickHandler(op)
  }

  return (
    <ActionPills
      active={option}
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

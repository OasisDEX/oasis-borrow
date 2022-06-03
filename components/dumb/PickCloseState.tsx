import { Grid } from '@theme-ui/components'
import { CloseVaultCard } from 'components/vault/CloseVaultCard'
import { FixedSizeArray } from 'helpers/types'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
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
  const [isActive, setIsActive] = useState(props.isCollateralActive)
  const [option, setOption] = useState(props.isCollateralActive ? 'collateral' : 'dai')
  const newComponentsEnabled = useFeatureToggle('NewComponents')
  const { t } = useTranslation()

  const onClickHandler = (op: string) => {
    setIsActive(op === props.optionNames[0])
    setOption(op)
    props.onclickHandler(op)
  }

  return newComponentsEnabled ? (
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
  ) : (
    <Grid columns={2} sx={{ pt: 3 }}>
      <CloseVaultCard
        text={`Close to ${props.collateralTokenSymbol}`}
        icon={props.collateralTokenIconCircle}
        onClick={onClickHandler}
        isActive={isActive}
        optionName={props.optionNames[0]}
      />
      <CloseVaultCard
        text="Close to DAI"
        icon="dai_circle_color"
        onClick={onClickHandler}
        isActive={!isActive}
        optionName={props.optionNames[1]}
      />
    </Grid>
  )
}

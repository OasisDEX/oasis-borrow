import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { PickCloseStateProps } from 'components/stateless/PickCloseState'
import { SliderValuePickerProps } from 'components/stateless/SliderValuePicker'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { FixedSizeArray } from 'helpers/types'
import { useState } from 'hoist-non-react-statics/node_modules/@types/react'
import React from 'react'

import { AdjustSlFormLayout, AdjustSlFormLayoutProps } from './AdjustSlFormLayout'

export function AdjustSlFormControl({ id }: { id: BigNumber }) {
  const token = 'ETH'
  const validOptions: FixedSizeArray<string, 2> = ['collateral', 'dai']
  const tokenData = getToken(token)
  const [collateralActive, setFirstActive] = useState(false)
  const [afterNewLiquidationPrice, setAfterLiqPrice] = useState(new BigNumber(3000))
  const [afterNewCollRatio, setAfterNewCollRatio] = useState(new BigNumber(300))
  const [selectedSLValue, setSelectedSLValue] = useState(new BigNumber(170))

  const currentCollRatio = new BigNumber(250)
  const liqRatio = new BigNumber(150)

  console.log(id, setAfterLiqPrice === undefined, setAfterNewCollRatio === undefined) //TODO: just to fool linter before having actual implementation

  const closeProps: PickCloseStateProps = {
    optionNames: validOptions,
    onclickHandler: (optionName: string) => {
      setFirstActive(optionName === validOptions[0])
    },
    isCollateralActive: collateralActive,
    collateralTokenSymbol: token,
    collateralTokenIconCircle: tokenData.iconCircle,
  }
  const sliderProps: SliderValuePickerProps = {
    disabled: false,
    leftBoundry: afterNewLiquidationPrice,
    rightBoundry: afterNewCollRatio,
    sliderKey: 'set-stoploss',
    lastValue: selectedSLValue,
    leftBoundryFormatter: (x: BigNumber) => formatAmount(x, 'USD'),
    leftBoundryStyling: { fontWeight: 'semiBold' },
    rightBoundryFormatter: (x: BigNumber) => formatPercent(x.times(100)),
    rightBoundryStyling: { fontWeight: 'semiBold', textAlign: 'right', color: 'primary' },
    maxBoundry: currentCollRatio,
    minBoundry: liqRatio,
    setter: setSelectedSLValue,
  }
  const props: AdjustSlFormLayoutProps = {
    closePickerConfig: closeProps,
    slValuePickerConfig: sliderProps,
  }
  return <AdjustSlFormLayout {...props} />
}

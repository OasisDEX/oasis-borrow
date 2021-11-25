import { useEffect } from '@storybook/addons'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseStateProps } from 'components/stateless/PickCloseState'
import { SliderValuePickerProps } from 'components/stateless/SliderValuePicker'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useObservableWithError } from 'helpers/observableHook'
import { FixedSizeArray } from 'helpers/types'
import { useState } from 'react'
import React from 'react'

import { TransactionLifecycle } from '../common/enums/TxStatus'
import { AddTriggerProps } from './AddTriggerLayout'
import { AdjustSlFormLayout, AdjustSlFormLayoutProps } from './AdjustSlFormLayout'

export function AdjustSlFormControl({ id }: { id: BigNumber }) {
  const token = 'ETH'
  const validOptions: FixedSizeArray<string, 2> = ['collateral', 'dai']
  const tokenData = getToken(token)
  const [collateralActive, setCloseToCollateral] = useState(false)
  const [txStatus, setTxStatus] = useState(TransactionLifecycle.None)

  const { vault$, collateralPrices$, ilkDataList$ } = useAppContext()
  const vaultDataWithError = useObservableWithError(vault$(id))
  const collateralPricesWithError = useObservableWithError(collateralPrices$)
  const ilksDataWithError = useObservableWithError(ilkDataList$)

  return (
    <WithErrorHandler
      error={[vaultDataWithError.error, collateralPricesWithError.error, ilksDataWithError.error]}
    >
      <WithLoadingIndicator
        value={[vaultDataWithError.value, collateralPricesWithError.value, ilksDataWithError.value]}
        customLoader={<VaultContainerSpinner />}
      >
        {([vaultData, collateralPriceData, ilksData]) => {
          const currentIlkData = ilksData.filter((x) => x.ilk === vaultData.ilk)[0]
          const currentCollateralData = collateralPriceData.data.filter(
            (x) => x.token === vaultData.token,
          )[0]
          const currentCollRatio = vaultData.lockedCollateral
            .multipliedBy(currentCollateralData.currentPrice)
            .dividedBy(vaultData.debt)
          const currentLiquidationPrice = currentCollateralData.currentPrice
            .multipliedBy(currentIlkData.liquidationRatio)
            .dividedBy(currentCollRatio)
          const [selectedSLValue, setSelectedSLValue] = useState(
            currentIlkData.liquidationRatio.multipliedBy(100),
          )
          const [afterNewLiquidationPrice, setAfterLiqPrice] = useState(
            new BigNumber(currentLiquidationPrice),
          )

          const liqRatio = currentIlkData.liquidationRatio

          const closeProps: PickCloseStateProps = {
            optionNames: validOptions,
            onclickHandler: (optionName: string) => {
              console.log('collateralActive', collateralActive)
              setCloseToCollateral(optionName === validOptions[1])
            },
            isCollateralActive: collateralActive,
            collateralTokenSymbol: token,
            collateralTokenIconCircle: tokenData.iconCircle,
          }

          const sliderProps: SliderValuePickerProps = {
            disabled: false,
            leftBoundry: selectedSLValue,
            rightBoundry: afterNewLiquidationPrice,
            sliderKey: 'set-stoploss',
            lastValue: selectedSLValue,
            leftBoundryFormatter: (x: BigNumber) => formatPercent(x),
            leftBoundryStyling: { fontWeight: 'semiBold' },
            rightBoundryFormatter: (x: BigNumber) => '$ ' + formatAmount(x, 'USD'),
            rightBoundryStyling: { fontWeight: 'semiBold', textAlign: 'right', color: 'primary' },
            maxBoundry: currentCollRatio.multipliedBy(100),
            minBoundry: liqRatio.multipliedBy(100),
            setter: (slCollRatio) => {
              setSelectedSLValue(slCollRatio)
              const currentCollRatio = vaultData.lockedCollateral
                .multipliedBy(currentCollateralData.currentPrice)
                .dividedBy(vaultData.debt)
              const computedAfterLiqPrice = slCollRatio
                .dividedBy(100)
                .multipliedBy(currentCollateralData.currentPrice)
                .dividedBy(currentCollRatio)
              setAfterLiqPrice(computedAfterLiqPrice)
            },
          }

          const addTriggerConfig: AddTriggerProps = {
            translationKey: 'add-stop-loss',
            onClick: () => setTxStatus(TransactionLifecycle.Requested),
          }

          const props: AdjustSlFormLayoutProps = {
            closePickerConfig: closeProps,
            slValuePickerConfig: sliderProps,
            addTriggerConfig: addTriggerConfig,
          }

          useEffect(() => {
            console.log('Tx Started')
          }, [txStatus])

          return <AdjustSlFormLayout {...props} />
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

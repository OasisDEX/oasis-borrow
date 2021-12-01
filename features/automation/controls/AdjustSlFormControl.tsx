import { TxState, TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import {
  addAutomationBotTrigger,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { networksById } from 'blockchain/config'
import { IlkDataList } from 'blockchain/ilks'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseStateProps } from 'components/stateless/PickCloseState'
import { SliderValuePickerProps } from 'components/stateless/SliderValuePicker'
import { ethers } from 'ethers'
import { CollateralPricesWithFilters } from 'features/collateralPrices/collateralPricesWithFilters'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useObservableWithError } from 'helpers/observableHook'
import { FixedSizeArray } from 'helpers/types'
import { useEffect, useState } from 'react'
import React from 'react'

import { RetryableLoadingButtonProps } from '../../../components/stateless/RetryableLoadingButton'
import { TriggersTypes } from '../common/enums/TriggersTypes'
import { extractSLData, StopLossTriggerData } from '../common/StopLossTriggerDataExtractor'
import { AddFormChange } from '../common/UITypes/AddFormChange'
import { AdjustSlFormLayout, AdjustSlFormLayoutProps } from './AdjustSlFormLayout'

function isTxStatusFinal(status: TxStatus) {
  return (
    status === TxStatus.CancelledByTheUser ||
    status === TxStatus.Failure ||
    status === TxStatus.Error ||
    status === TxStatus.Success
  )
}

function isTxStatusFailed(status: TxStatus) {
  return isTxStatusFinal(status) && status !== TxStatus.Success
}

function buildTriggerData(id: BigNumber, isCloseToCollateral: boolean, slLevel: number): string {
  return ethers.utils.defaultAbiCoder.encode(
    ['uint256', 'bool', 'uint256'],
    [id.toNumber(), isCloseToCollateral, Math.round(slLevel)],
  )
}

function prepareTriggerData(
  vaultData: Vault,
  isCloseToCollateral: boolean,
  stopLossLevel: BigNumber,
): AutomationBotAddTriggerData {
  const slLevel: number = stopLossLevel.toNumber()
  const networkConfig = networksById[vaultData.chainId]

  return {
    cdpId: vaultData.id,
    kind: TxMetaKind.addTrigger,
    triggerType: isCloseToCollateral
      ? new BigNumber(TriggersTypes.StopLossToCollateral)
      : new BigNumber(TriggersTypes.StopLossToDai),
    proxyAddress: vaultData.owner,
    serviceRegistry: networkConfig.serviceRegistry,
    triggerData: buildTriggerData(vaultData.id, isCloseToCollateral, slLevel),
  }
}

export function AdjustSlFormControl({ id }: { id: BigNumber }) {
  const uiSubjectName = 'AdjustSlForm'
  const validOptions: FixedSizeArray<string, 2> = ['collateral', 'dai']
  const [collateralActive, setCloseToCollateral] = useState(false)
  const [selectedSLValue, setSelectedSLValue] = useState(new BigNumber(0))
  //const [txLoderCompletedHandler, setTxHandler] = useState<(succeded : boolean) => void>();

  const {
    vault$,
    collateralPrices$,
    ilkDataList$,
    uiChanges,
    automationTriggersData$,
    txHelpers$,
    connectedContext$,
  } = useAppContext()

  const autoTriggersData$ = automationTriggersData$(id)

  const vaultDataWithError = useObservableWithError(vault$(id))
  const collateralPricesWithError = useObservableWithError(collateralPrices$)
  const ilksDataWithError = useObservableWithError(ilkDataList$)
  const autoTriggerDataWithError = useObservableWithError(autoTriggersData$)
  const txHelpersWithError = useObservableWithError(txHelpers$)
  const contextWithError = useObservableWithError(connectedContext$)

  uiChanges.createIfMissing<AddFormChange>(uiSubjectName, {
    selectedSLValue: new BigNumber(0),
    collateralActive: false,
  })

  function publishUIChange(props: AddFormChange) {
    uiChanges.publish<AddFormChange>(uiSubjectName, props)
  }

  function renderLayout(
    vaultData: Vault,
    collateralPriceData: CollateralPricesWithFilters,
    ilksData: IlkDataList,
    slTriggerData: StopLossTriggerData,
    txHelpers: TxHelpers,
    isOwner: boolean,
  ) {
    const token = vaultData.token
    const tokenData = getToken(token)
    const currentIlkData = ilksData.filter((x) => x.ilk === vaultData.ilk)[0]
    const currentCollateralData = collateralPriceData.data.filter(
      (x) => x.token === vaultData.token,
    )[0]
    const startingSlRatio = slTriggerData.isStopLossEnabled
      ? slTriggerData.stopLossLevel
      : currentIlkData.liquidationRatio

    const currentCollRatio = vaultData.lockedCollateral
      .multipliedBy(currentCollateralData.currentPrice)
      .dividedBy(vaultData.debt)
    const startingAfterNewLiquidationPrice = currentCollateralData.currentPrice
      .multipliedBy(startingSlRatio)
      .dividedBy(currentCollRatio)

    const [afterNewLiquidationPrice, setAfterLiqPrice] = useState(
      new BigNumber(startingAfterNewLiquidationPrice),
    )

    const [txStatus, txStatusSetter] = useState<TxState<AutomationBotAddTriggerData> | undefined>(
      undefined,
    )

    const liqRatio = currentIlkData.liquidationRatio

    //set proper defaults
    useEffect(() => {
      setSelectedSLValue(startingSlRatio.multipliedBy(100))
    }, [])

    const closeProps: PickCloseStateProps = {
      optionNames: validOptions,
      onclickHandler: (optionName: string) => {
        setCloseToCollateral(optionName === validOptions[1])
        publishUIChange({
          selectedSLValue,
          collateralActive,
        })
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
        /*TO DO: this is duplicated and can be extracted*/
        const currentCollRatio = vaultData.lockedCollateral
          .multipliedBy(currentCollateralData.currentPrice)
          .dividedBy(vaultData.debt)
        const computedAfterLiqPrice = slCollRatio
          .dividedBy(100)
          .multipliedBy(currentCollateralData.currentPrice)
          .dividedBy(currentCollRatio)
        /* END OF DUPLICATION */
        setAfterLiqPrice(computedAfterLiqPrice)
        publishUIChange({
          selectedSLValue: slCollRatio,
          collateralActive,
        })
      },
    }

    const addTriggerConfig: RetryableLoadingButtonProps = {
      translationKey: 'add-stop-loss',
      onClick: (finishLoader: (succeded: boolean) => void) => {
        const txSendSuccessHandler = (x: TxState<AutomationBotAddTriggerData>) => {
          console.log('Tx Status', x)
          txStatusSetter(x)
          if (isTxStatusFinal(x.status)) {
            if (isTxStatusFailed(x.status)) {
              finishLoader(false)
              waitForTx.unsubscribe()
              txStatusSetter(undefined)
            } else {
              finishLoader(true)
              waitForTx.unsubscribe()
              txStatusSetter(undefined)
            }
          }
        }

        const sendTxErrorHandler = () => {
          finishLoader(false)
        }

        const txData = prepareTriggerData(vaultData, collateralActive, selectedSLValue)

        const waitForTx = txHelpers
          .sendWithGasEstimation(addAutomationBotTrigger, txData)
          .subscribe(txSendSuccessHandler, sendTxErrorHandler)
      },
      isLoading: false,
      isRetry: false,
      disabled: isOwner,
    }

    const props: AdjustSlFormLayoutProps = {
      closePickerConfig: closeProps,
      slValuePickerConfig: sliderProps,
      addTriggerConfig: addTriggerConfig,
      txState: txStatus,
    }

    return <AdjustSlFormLayout {...props} />
  }

  return (
    <WithErrorHandler
      error={[
        vaultDataWithError.error,
        collateralPricesWithError.error,
        ilksDataWithError.error,
        autoTriggerDataWithError.error,
        txHelpersWithError.error,
        contextWithError.error,
      ]}
    >
      <WithLoadingIndicator
        value={[
          vaultDataWithError.value,
          collateralPricesWithError.value,
          ilksDataWithError.value,
          autoTriggerDataWithError.value,
          txHelpersWithError.value,
          contextWithError.value,
        ]}
        customLoader={<VaultContainerSpinner />}
      >
        {([v, c, i, s, tx, ctx]) => {
          return renderLayout(v, c, i, extractSLData(s), tx, ctx.account !== v.controller)
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

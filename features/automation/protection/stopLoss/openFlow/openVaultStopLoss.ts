import {
  AutomationEventIds,
  CommonAnalyticsSections,
  Pages,
  trackingEvents,
} from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Tickers } from 'blockchain/prices'
import { getToken } from 'blockchain/tokensMetadata'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import {
  closeVaultOptions,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
  NEXT_COLL_RATIO_OFFSET,
} from 'features/automation/common/consts'
import { getSliderPercentageFill } from 'features/automation/protection/stopLoss/helpers'
import { SidebarAdjustStopLossEditingStageProps } from 'features/automation/protection/stopLoss/sidebars/SidebarAdjustStopLossEditingStage'
import { stopLossSliderBasicConfig } from 'features/automation/protection/stopLoss/sliderConfig'
import { StopLossFormChange } from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { CloseVaultTo } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'

export type OpenVaultStopLossLevelChange = {
  kind: 'stopLossLevel'
  level: BigNumber
}

export type OpenVaultStopLossCloseTypeChange = {
  kind: 'stopLossCloseType'
  type: 'dai' | 'collateral'
}

export type OpenVaultStopLossChanges =
  | OpenVaultStopLossLevelChange
  | OpenVaultStopLossCloseTypeChange

export function applyOpenVaultStopLoss<S>(state: S, change: OpenVaultStopLossChanges) {
  if (change.kind === 'stopLossLevel') {
    return {
      ...state,
      stopLossLevel: change.level,
    }
  }

  if (change.kind === 'stopLossCloseType') {
    return {
      ...state,
      stopLossCloseType: change.type,
    }
  }

  return state
}

export function getDataForStopLoss(
  props: {
    token: string
    priceInfo: PriceInfo
    ilkData: IlkData
    balanceInfo: BalanceInfo
    afterCollateralizationRatioAtNextPrice: BigNumber
    afterCollateralizationRatio: BigNumber
    afterLiquidationPrice: BigNumber
    setStopLossCloseType: (type: CloseVaultTo) => void
    setStopLossLevel: (level: BigNumber) => void
    stopLossCloseType: CloseVaultTo
    proxyAddress?: string
    stopLossLevel: BigNumber
    totalExposure?: BigNumber
    depositAmount?: BigNumber
    generateAmount?: BigNumber
    afterOutstandingDebt?: BigNumber
  },
  feature: 'borrow' | 'multiply',
) {
  const { t } = useTranslation()

  const {
    token,
    priceInfo: { nextCollateralPrice, currentEthPrice, currentCollateralPrice },
    ilkData,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    afterLiquidationPrice,
    totalExposure,
    depositAmount,
    ilkData: { ilk, liquidationPenalty, liquidationRatio, debtFloor },
    balanceInfo: { ethBalance },
    setStopLossCloseType,
    setStopLossLevel,
    stopLossCloseType,
    stopLossLevel,
    afterOutstandingDebt,
    generateAmount,
    proxyAddress,
  } = props

  const debt = feature === 'multiply' ? afterOutstandingDebt : generateAmount
  const lockedCollateral = feature === 'multiply' ? totalExposure : depositAmount
  const tokenData = getToken(token)

  const sliderPercentageFill = getSliderPercentageFill({
    value: stopLossLevel,
    min: ilkData.liquidationRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.div(100)).times(100),
    max: afterCollateralizationRatioAtNextPrice.minus(NEXT_COLL_RATIO_OFFSET.div(100)).times(100),
  })

  const afterNewLiquidationPrice = stopLossLevel
    .dividedBy(100)
    .multipliedBy(nextCollateralPrice)
    .dividedBy(afterCollateralizationRatioAtNextPrice)

  const executionPrice = collateralPriceAtRatio({
    colRatio: stopLossLevel.div(100),
    collateral: lockedCollateral || zero,
    vaultDebt: debt || zero,
  })

  const stopLossSidebarProps: SidebarAdjustStopLossEditingStageProps = {
    executionPrice,
    errors: [],
    warnings: [],
    stopLossState: {
      stopLossLevel,
      collateralActive: stopLossCloseType === 'collateral',
      currentForm: 'add',
    } as StopLossFormChange,
    isEditing: true,
    closePickerConfig: {
      optionNames: closeVaultOptions,
      onclickHandler: (optionName: string) => {
        setStopLossCloseType(optionName as CloseVaultTo)
        trackingEvents.automation.buttonClick(
          AutomationEventIds.CloseToX,
          Pages.OpenVault,
          CommonAnalyticsSections.Form,
          {
            vaultId: 'n/a',
            ilk,
            closeTo: optionName as CloseVaultTo,
          },
        )
      },
      isCollateralActive: stopLossCloseType === 'collateral',
      collateralTokenSymbol: token,
      collateralTokenIconCircle: tokenData.iconCircle,
    },
    sliderConfig: {
      ...stopLossSliderBasicConfig,
      sliderPercentageFill,
      leftLabel: t('slider.set-stoploss.left-label'),
      rightLabel: t('slider.set-stoploss.right-label'),
      leftBoundry: stopLossLevel,
      rightBoundry: afterNewLiquidationPrice,
      lastValue: stopLossLevel,
      maxBoundry: new BigNumber(
        afterCollateralizationRatioAtNextPrice
          .minus(NEXT_COLL_RATIO_OFFSET.div(100))
          .multipliedBy(100)
          .toFixed(0, BigNumber.ROUND_DOWN),
      ),
      minBoundry: ilkData.liquidationRatio.multipliedBy(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
      onChange: (level) => setStopLossLevel(level),
    },
    isOpenFlow: true,
  }

  const automationContextProps = {
    generalManageVault: {
      state: {
        balanceInfo: { ethBalance },
        vault: {
          id: zero,
          token,
          ilk,
          debt,
          debtOffset: zero,
          owner: proxyAddress,
          controller: '0x0',
          lockedCollateral,
          collateralizationRatio: afterCollateralizationRatio,
          collateralizationRatioAtNextPrice: afterCollateralizationRatioAtNextPrice,
          liquidationPrice: afterLiquidationPrice,
        },
        priceInfo: { nextCollateralPrice },
        ilkData: { liquidationRatio, debtFloor, liquidationPenalty },
      },
      type: feature,
    } as GeneralManageVaultState,
    context: { status: 'connected', account: '0x0', etherscan: { url: '' } } as Context,
    ethAndTokenPricesData: { ETH: currentEthPrice, [token]: currentCollateralPrice } as Tickers,
  }

  return { stopLossSidebarProps, automationContextProps }
}

export type StopLossOpenFlowStages =
  | 'stopLossEditing'
  | 'stopLossTxWaitingForConfirmation'
  | 'stopLossTxWaitingForApproval'
  | 'stopLossTxInProgress'
  | 'stopLossTxFailure'
  | 'stopLossTxSuccess'

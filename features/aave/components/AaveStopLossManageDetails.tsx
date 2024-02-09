import type { mapStopLossFromLambda } from 'features/aave/manage/helpers/map-stop-loss-from-lambda'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import { getAaveLikeStopLossParams } from 'features/aave/open/helpers'
import { StopLossDetailCards } from 'features/automation/metadata/types'
import { StopLossDetailsLayout } from 'features/automation/protection/stopLoss/controls/StopLossDetailsLayout'
import {
  getCollateralDuringLiquidation,
  getDynamicStopLossPrice,
  getMaxToken,
} from 'features/automation/protection/stopLoss/helpers'
import { formatPercent } from 'helpers/formatters/format'
import type { GetTriggersResponse } from 'helpers/triggers'
import { one, zero } from 'helpers/zero'
import type { AaveLikeReserveConfigurationData } from 'lendingProtocols/aave-like-common'
import React, { useMemo } from 'react'

export const AaveStopLossManageDetails = ({
  state,
  stopLossLambdaData,
  stopLossToken,
  debtTokenReserveConfigurationData,
}: Pick<ManageAaveStateProps, 'state'> & {
  triggers?: GetTriggersResponse['triggers']
  stopLossLambdaData: ReturnType<typeof mapStopLossFromLambda>
  stopLossToken: 'debt' | 'collateral'
  debtTokenReserveConfigurationData: AaveLikeReserveConfigurationData
}) => {
  const { strategyConfig, currentPosition } = state.context
  const {
    stopLossLevel,
    dynamicStopLossPrice,
    debt,
    positionRatio,
    liquidationPrice,
    liquidationRatio,
    lockedCollateral,
  } = getAaveLikeStopLossParams.manage({ state })
  const isStopLossEnabled = stopLossLambdaData.stopLossLevel !== undefined
  const token = strategyConfig.tokens.collateral
  const debtToken = strategyConfig.tokens.debt
  const {
    riskRatio: { loanToValue },
  } = currentPosition!
  const maxToken = getMaxToken({
    stopLossLevel: stopLossLambdaData.stopLossLevel?.isZero()
      ? zero
      : one.div((stopLossLambdaData.stopLossLevel || one).div(100)).times(100),
    lockedCollateral,
    liquidationRatio: one.div(liquidationRatio),
    liquidationPrice,
    debt,
  })
  const afterMaxToken = getMaxToken({
    stopLossLevel: stopLossLevel.isZero() ? zero : one.div(stopLossLevel.div(100)).times(100),
    lockedCollateral,
    liquidationRatio: one.div(liquidationRatio),
    liquidationPrice,
    debt,
  })
  const setDynamicStopLossPrice = getDynamicStopLossPrice({
    liquidationPrice,
    liquidationRatio: one.div(liquidationRatio),
    stopLossLevel: one.div((stopLossLambdaData.stopLossLevel || one).div(100)).times(100),
  })

  const stopLossConfigChanged = useMemo(() => {
    return !!(
      stopLossLambdaData.stopLossLevel &&
      (!stopLossLevel.eq(stopLossLambdaData.stopLossLevel) ||
        stopLossLambdaData.stopLossToken !== stopLossToken)
    )
  }, [stopLossLambdaData, stopLossLevel, stopLossToken])
  return (
    <StopLossDetailsLayout
      token={token}
      debtToken={debtToken}
      // stopLossLevel is multiplied by 100 in the display component
      stopLossLevel={stopLossLambdaData.stopLossLevel?.div(10 ** 2) || zero}
      afterStopLossLevel={stopLossLevel}
      debt={debt}
      isStopLossEnabled={isStopLossEnabled}
      liquidationRatio={liquidationRatio}
      liquidationPrice={liquidationPrice}
      liquidationPenalty={debtTokenReserveConfigurationData.liquidationBonus}
      lockedCollateral={lockedCollateral}
      nextPositionRatio={loanToValue.decimalPlaces(5)}
      collateralDuringLiquidation={getCollateralDuringLiquidation({
        lockedCollateral,
        debt,
        liquidationPrice,
        liquidationPenalty: debtTokenReserveConfigurationData.liquidationBonus,
      })}
      triggerMaxToken={maxToken}
      afterMaxToken={afterMaxToken}
      isCollateralActive={stopLossToken === 'collateral'}
      isEditing={stopLossConfigChanged}
      positionRatio={positionRatio}
      ratioParamTranslationKey={'system.loan-to-value'}
      stopLossLevelCardFootnoteKey={'system.cards.stop-loss-collateral-ratio.footnote-above'}
      detailCards={{
        cardsSet: [
          StopLossDetailCards.STOP_LOSS_LEVEL,
          StopLossDetailCards.LOAN_TO_VALUE,
          StopLossDetailCards.DYNAMIC_STOP_PRICE,
          StopLossDetailCards.ESTIMATED_TOKEN_ON_TRIGGER,
        ],
        cardsConfig: {
          stopLossLevelCard: {
            modalDescription: 'manage-multiply-vault.card.stop-loss-ltv-desc',
            belowCurrentPositionRatio: formatPercent(
              (stopLossLambdaData.stopLossLevel?.div(10 ** 2) || one)
                .minus(positionRatio)
                .times(100),
              {
                precision: 2,
              },
            ),
          },
        },
      }}
      dynamicStopLossPrice={setDynamicStopLossPrice}
      afterDynamicStopLossPrice={dynamicStopLossPrice}
      isAutomationDataLoaded={true}
      isAutomationAvailable={true}
    />
  )
}

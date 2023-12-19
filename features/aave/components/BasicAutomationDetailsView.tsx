import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import {
  DetailsSectionContentCard,
  DetailsSectionContentCardWrapper,
} from 'components/DetailsSectionContentCard'
import type { PositionLike } from 'features/aave/manage/state'
import { AutomationFeatures } from 'features/automation/common/types'
import { formatPercent } from 'helpers/formatters/format'
import React from 'react'
import { useTranslation } from 'react-i18next'

export interface BasicAutomationDetailsViewProps {
  automationFeature: AutomationFeatures.AUTO_SELL | AutomationFeatures.AUTO_BUY
  position: PositionLike
  currentTrigger?: {
    executionLTV: BigNumber
    targetLTV: BigNumber
  }
  afterTxTrigger?: {
    executionLTV: BigNumber
    targetLTV: BigNumber
  }
}

interface ContentCardTriggerLTVProp {
  automationFeature: AutomationFeatures.AUTO_SELL | AutomationFeatures.AUTO_BUY
  collateralToken: string
  currentExecutionLTV?: BigNumber
  afterTxExecutionLTV?: BigNumber
}

interface ContentCardTriggerTargetLTVProp {
  automationFeature: AutomationFeatures.AUTO_SELL | AutomationFeatures.AUTO_BUY
  collateralToken: string
  currentTargetLTV?: BigNumber
  afterTxTargetLTV?: BigNumber
}

export function ContentCardTriggerExecutionLTV({
  automationFeature,
  collateralToken,
  currentExecutionLTV,
  afterTxExecutionLTV,
}: ContentCardTriggerLTVProp) {
  const { t } = useTranslation()

  const formatted = {
    current:
      currentExecutionLTV &&
      formatPercent(currentExecutionLTV, {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
    afterTx:
      afterTxExecutionLTV &&
      formatPercent(afterTxExecutionLTV, {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
  }

  const titleKey =
    automationFeature === AutomationFeatures.AUTO_SELL
      ? 'auto-sell.trigger-ltv-to-sell-token'
      : 'auto-buy.trigger-ltv-to-buy-token'

  const contentCardSettings: ContentCardProps = {
    title: t(titleKey, { token: collateralToken }),
    value: formatted.current,
    change: afterTxExecutionLTV && {
      value: `${formatted.afterTx} ${t('system.cards.common.after')}`,
      variant: 'positive',
    },
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}

function ContentCardTriggerTargetLTV({
  automationFeature,
  currentTargetLTV,
  afterTxTargetLTV,
}: ContentCardTriggerTargetLTVProp) {
  const { t } = useTranslation()

  const formatted = {
    current:
      currentTargetLTV &&
      formatPercent(currentTargetLTV, {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
    afterTx:
      afterTxTargetLTV &&
      formatPercent(afterTxTargetLTV, {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
  }

  const titleKey =
    automationFeature === AutomationFeatures.AUTO_SELL
      ? 'auto-sell.target-ltv-after-selling'
      : 'auto-buy.target-ltv-after-buying'

  const contentCardSettings: ContentCardProps = {
    title: t(titleKey),
    value: formatted.current,
    change: afterTxTargetLTV && {
      value: `${formatted.afterTx} ${t('system.cards.common.after')}`,
      variant: 'positive',
    },
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}

export function BasicAutomationDetailsView({
  automationFeature,
  position,
  currentTrigger,
  afterTxTrigger,
}: BasicAutomationDetailsViewProps) {
  const { t } = useTranslation()
  const titleKey =
    automationFeature === AutomationFeatures.AUTO_SELL ? 'auto-sell.title' : 'auto-buy.title'

  return (
    <DetailsSection
      title={t(titleKey)}
      badge={currentTrigger !== undefined}
      content={
        <>
          <DetailsSectionContentCardWrapper>
            <ContentCardTriggerExecutionLTV
              automationFeature={automationFeature}
              collateralToken={position.collateral.token.symbol}
              currentExecutionLTV={currentTrigger?.executionLTV}
              afterTxExecutionLTV={afterTxTrigger?.executionLTV}
            />
            <ContentCardTriggerTargetLTV
              automationFeature={automationFeature}
              collateralToken={position.collateral.token.symbol}
              currentTargetLTV={currentTrigger?.targetLTV}
              afterTxTargetLTV={afterTxTrigger?.targetLTV}
            />
          </DetailsSectionContentCardWrapper>
        </>
      }
    />
  )
}

import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import {
  DetailsSectionContentCard,
  DetailsSectionContentCardWrapper,
} from 'components/DetailsSectionContentCard'
import type { PositionLike } from 'features/aave/manage/state'
import { formatPercent } from 'helpers/formatters/format'
import React from 'react'
import { useTranslation } from 'react-i18next'

export interface AutoBuyDetailsLayoutProps {
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
  collateralToken: string
  currentExecutionLTV?: BigNumber
  afterTxExecutionLTV?: BigNumber
}

interface ContentCardTriggerTargetLTVProp {
  collateralToken: string
  currentTargetLTV?: BigNumber
  afterTxTargetLTV?: BigNumber
}

export function ContentCardTriggerExecutionLTV({
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

  const contentCardSettings: ContentCardProps = {
    title: t('auto-buy.trigger-ltv-to-buy-token', { token: collateralToken }),
    value: formatted.current,
    change: afterTxExecutionLTV && {
      value: `${formatted.afterTx} ${t('system.cards.common.after')}`,
      variant: 'positive',
    },
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}

function ContentCardTriggerTargetLTV({
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

  const contentCardSettings: ContentCardProps = {
    title: t('auto-buy.target-ltv-after-buying'),
    value: formatted.current,
    change: afterTxTargetLTV && {
      value: `${formatted.afterTx} ${t('system.cards.common.after')}`,
      variant: 'positive',
    },
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}

export function AutoBuySection({
  position,
  currentTrigger,
  afterTxTrigger,
}: AutoBuyDetailsLayoutProps) {
  const { t } = useTranslation()
  return (
    <DetailsSection
      title={t('auto-buy.title')}
      badge={false}
      content={
        <>
          {/*{*/}
          {/*  <Box mb={3}>*/}
          {/*    <MessageCard*/}
          {/*      type="warning"*/}
          {/*      messages={[t('vault-warnings.auto-buy-override')]}*/}
          {/*      withBullet={false}*/}
          {/*    />*/}
          {/*  </Box>*/}
          {/*}*/}
          <DetailsSectionContentCardWrapper>
            <ContentCardTriggerExecutionLTV
              collateralToken={position.collateral.token.symbol}
              currentExecutionLTV={currentTrigger?.executionLTV}
              afterTxExecutionLTV={afterTxTrigger?.executionLTV}
            />
            <ContentCardTriggerTargetLTV
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

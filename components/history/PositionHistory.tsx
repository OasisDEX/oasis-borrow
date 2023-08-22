import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { useMainContext } from 'components/context'
import { DefinitionList } from 'components/DefinitionList'
import { DetailsSection } from 'components/DetailsSection'
import { PositionHistoryItem } from 'components/history/PositionHistoryItem'
import { Skeleton } from 'components/Skeleton'
import { AjnaUnifiedHistoryEvent } from 'features/ajna/history/ajnaUnifiedHistoryEvent'
import { AaveHistoryEvent } from 'features/ajna/history/types'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { FC } from 'react'

interface PositionHistoryProps {
  collateralToken: string
  historyEvents: Partial<AjnaUnifiedHistoryEvent>[] | Partial<AaveHistoryEvent>[]
  isOracless?: boolean
  isShort?: boolean
  priceFormat?: string
  quoteToken: string
}

export const PositionHistory: FC<PositionHistoryProps> = ({
  collateralToken,
  historyEvents,
  isOracless = false,
  isShort = false,
  priceFormat,
  quoteToken,
}) => {
  const { context$ } = useMainContext()
  const [context] = useObservable(context$)

  const { t } = useTranslation()
  return !context ? (
    <Skeleton height="440px" />
  ) : (
    <DetailsSection
      title={t('position-history.header')}
      content={
        <DefinitionList>
          {historyEvents.map((item) => (
            <PositionHistoryItem
              collateralToken={collateralToken}
              etherscanUrl={getNetworkContracts(NetworkIds.MAINNET, context.chainId).etherscan.url}
              ethtxUrl={getNetworkContracts(NetworkIds.MAINNET, context.chainId).ethtx.url}
              isOracless={isOracless}
              isShort={isShort}
              item={item}
              key={`${item.id}-${item.txHash}`}
              priceFormat={priceFormat}
              quoteToken={quoteToken}
            />
          ))}
        </DefinitionList>
      }
    />
  )
}

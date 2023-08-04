import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { useAppContext } from 'components/AppContextProvider'
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
  historyEvents: Partial<AjnaUnifiedHistoryEvent>[] | Partial<AaveHistoryEvent>[]
  collateralToken: string
  quoteToken: string
  isShort?: boolean
  priceFormat?: string
}

export const PositionHistory: FC<PositionHistoryProps> = ({
  historyEvents,
  quoteToken,
  collateralToken,
  isShort = false,
  priceFormat,
}) => {
  const { context$ } = useAppContext()
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
              item={item}
              etherscanUrl={getNetworkContracts(NetworkIds.MAINNET, context.chainId).etherscan.url}
              ethtxUrl={getNetworkContracts(NetworkIds.MAINNET, context.chainId).ethtx.url}
              key={`${item.id}-${item.txHash}`}
              isShort={isShort}
              priceFormat={priceFormat}
              quoteToken={quoteToken}
              collateralToken={collateralToken}
            />
          ))}
        </DefinitionList>
      }
    />
  )
}

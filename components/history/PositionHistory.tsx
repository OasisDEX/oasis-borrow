import React, { FC } from 'react'
import { ensureEtherscanExist, getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { DefinitionList } from 'components/DefinitionList'
import { DetailsSection } from 'components/DetailsSection'
import { PositionHistoryItem } from 'components/history/PositionHistoryItem'
import { AjnaUnifiedHistoryEvent } from 'features/ajna/history/ajnaUnifiedHistoryEvent'
import { AaveHistoryEvent } from 'features/ajna/history/types'
import { useTranslation } from 'next-i18next'

interface PositionHistoryProps {
  collateralToken: string
  historyEvents: Partial<AjnaUnifiedHistoryEvent>[] | Partial<AaveHistoryEvent>[]
  isOracless?: boolean
  isShort?: boolean
  priceFormat?: string
  quoteToken: string
  networkId: NetworkIds
}

export const PositionHistory: FC<PositionHistoryProps> = ({
  collateralToken,
  historyEvents,
  isOracless = false,
  isShort = false,
  priceFormat,
  quoteToken,
  networkId,
}) => {
  const { t } = useTranslation()

  const contracts = getNetworkContracts(networkId)

  ensureEtherscanExist(networkId, contracts)
  const { etherscan, ethtx } = contracts

  return (
    <DetailsSection
      title={t('position-history.header')}
      content={
        <DefinitionList>
          {historyEvents.map((item) => (
            <PositionHistoryItem
              collateralToken={collateralToken}
              etherscanUrl={etherscan.url}
              ethtxUrl={ethtx.url}
              isOracless={isOracless}
              isShort={isShort}
              item={item}
              key={`${item.id}-${item.txHash}`}
              priceFormat={priceFormat}
              quoteToken={quoteToken}
              networkId={networkId}
            />
          ))}
        </DefinitionList>
      }
    />
  )
}

import { ensureEtherscanExist, getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { DefinitionList } from 'components/DefinitionList'
import { DetailsSection } from 'components/DetailsSection'
import { PositionHistoryItem } from 'components/history/PositionHistoryItem'
import type { AaveLikeHistoryEvent } from 'features/omni-kit/protocols/aave-like/history/types'
import type { AjnaHistoryEvent } from 'features/omni-kit/protocols/ajna/history/types'
import type { Erc4626HistoryEvent } from 'features/omni-kit/protocols/erc-4626/history/types'
import { filterAndGroupByTxHash } from 'features/positionHistory/filterAndGroupByTxHash'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface PositionHistoryProps {
  collateralToken: string
  historyEvents:
    | Partial<AjnaHistoryEvent>[]
    | Partial<AaveLikeHistoryEvent>[]
    | Partial<PositionHistoryEvent>[]
    | Partial<Erc4626HistoryEvent>[]
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
  const { etherscan } = contracts

  const filteredEvents = filterAndGroupByTxHash(historyEvents)

  return (
    <DetailsSection
      title={t('position-history.header')}
      content={
        <DefinitionList>
          {filteredEvents.map((item) => (
            <PositionHistoryItem
              collateralToken={collateralToken}
              etherscanConfig={etherscan}
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

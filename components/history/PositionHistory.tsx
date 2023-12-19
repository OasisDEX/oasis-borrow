import { ensureEtherscanExist, getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { DefinitionList } from 'components/DefinitionList'
import { DetailsSection } from 'components/DetailsSection'
import { PositionHistoryItem } from 'components/history/PositionHistoryItem'
import type { AaveHistoryEvent } from 'features/omni-kit/protocols/aave/history/types'
import type { AjnaUnifiedHistoryEvent } from 'features/omni-kit/protocols/ajna/history'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

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
  const { etherscan } = contracts
  return (
    <DetailsSection
      title={t('position-history.header')}
      content={
        <DefinitionList>
          {historyEvents.map((item) => (
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

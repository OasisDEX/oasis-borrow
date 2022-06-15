import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { ContentCardTargetColRatio } from 'components/vault/detailsSection/ContentCardTargetColRatio'
import { ContentCardTriggerColRatio } from 'components/vault/detailsSection/ContentCardTriggerColRatio'
import React from 'react'

export interface OptimizationDetailsLayoutProps {
  vault: Vault
}

export function OptimizationDetailsLayout({ vault }: OptimizationDetailsLayoutProps) {
  const { token } = vault

  return (
    <DetailsSection
      title="Auto buy"
      badge={false}
      content={
        <DetailsSectionContentCardWrapper>
          <ContentCardTriggerColRatio
            token={token}
            triggerColRatio={new BigNumber(Math.random() * 100)}
            nextBuyPrice={new BigNumber(Math.random() * 1000)}
          />
          <ContentCardTargetColRatio
            token={token}
            targetColRatio={new BigNumber(Math.random() * 100)}
            threshold={new BigNumber(Math.random() * 1000)}
          />
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}

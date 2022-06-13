import { Vault } from 'blockchain/vaults'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import React from 'react'

export interface OptimizationDetailsLayoutProps {
  vault: Vault
}

export function OptimizationDetailsLayout({ vault }: OptimizationDetailsLayoutProps) {
  return (
    <DetailsSection
      title="Title"
      content={
        <DetailsSectionContentCardWrapper>
          An optimization tab for vault#{vault.id.toNumber()}.
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}


import React from 'react'
import { useTranslation } from 'react-i18next'

interface PortfolioWalletSummaryProps {
  totalAssets: number
  totalAssetsChange: number
}

export const PortfolioWalletSummary = ({ totalAssets, totalAssetsChange }: PortfolioWalletSummaryProps) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  return <>test</>
}

import { usePortfolioPositionsCount } from 'helpers/clients/portfolio-positions-count'
import { getLocalAppConfig } from 'helpers/config'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { Spinner } from 'theme-ui'

export function MyPositionsLink() {
  const { t } = useTranslation()
  const { NewPortfolio } = getLocalAppConfig('features')
  const { amountOfPositions: oldAmountOfPositions, walletAddress } = useAccount()
  const { amountOfPositions: newAmountOfPositions } = usePortfolioPositionsCount({
    address: walletAddress?.toLowerCase(),
  })
  const amountOfPositions = NewPortfolio ? newAmountOfPositions : oldAmountOfPositions

  return (
    <>
      {t('portfolio')} (
      {amountOfPositions !== undefined && amountOfPositions >= 0 ? (
        amountOfPositions
      ) : (
        <Spinner
          size={14}
          color={ajnaExtensionTheme.colors.neutral80}
          sx={{ verticalAlign: 'text-bottom' }}
        />
      )}
      )
    </>
  )
}

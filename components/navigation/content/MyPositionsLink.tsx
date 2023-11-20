import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { Spinner } from 'theme-ui'

export function MyPositionsLink() {
  const { t } = useTranslation()
  const { amountOfPositions } = useAccount()

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

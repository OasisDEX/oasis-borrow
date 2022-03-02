import { Heading } from '@theme-ui/components'
import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React from 'react'

import { useObservable } from '../../helpers/observableHook'
import { useAppContext } from '../AppContextProvider'

interface VaultHeadingManageProps {
  vaultId: BigNumber
}

function VaultHeadingManage({ vaultId }: VaultHeadingManageProps) {
  const { t } = useTranslation()

  const { ilkDataList$, vault$ } = useAppContext()
  const [ilkDataList] = useObservable(ilkDataList$)
  const [vault] = useObservable(vault$(vaultId))

  const ilkData = ilkDataList?.filter((x) => x.ilk === vault?.ilk)[0]

  return <>{ilkData ? t('vault.header', { ilk: ilkData.ilk, id: vaultId }) : ''}</>
}

interface VaultHeadingOpenProps {
  ilk: string
}

function VaultHeadingOpen({ ilk }: VaultHeadingOpenProps) {
  const { t } = useTranslation()

  return <>{t('vault.open-vault', { ilk })}</>
}

export function VaultHeading() {
  const router = useRouter()
  const {
    query: { ilk, vault },
  } = router

  const vaultId = typeof vault === 'string' ? new BigNumber(vault) : null
  const ilkName = typeof ilk === 'string' ? ilk : null

  return (
    <Heading
      as="h1"
      variant="heading1"
      sx={{
        fontWeight: 'semiBold',
        pb: 2,
      }}
    >
      {vaultId && !ilkName && <VaultHeadingManage vaultId={vaultId} />}
      {ilkName && !vaultId && <VaultHeadingOpen ilk={ilkName} />}
    </Heading>
  )
}

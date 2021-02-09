import React from 'react'
import { AppLayout } from 'components/Layouts'
import { useRouter } from 'next/router'
import { OpenVaultView } from 'features/openVault/openVaultView'

export default function OpenPage() {
  const {
    query: { ilk },
  } = useRouter()
  return <OpenVaultView {...{ ilk: ilk as string }} />
}

OpenPage.layout = AppLayout

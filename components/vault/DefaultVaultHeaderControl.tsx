import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservableWithError } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { DefaultVaultHeaderLayout, DefaultVaultHeaderLayoutProps } from './DefaultVaultHeaderLayout'

export interface DefaultVaultHeaderControlProps {
  header: string
  vaultId: BigNumber
}

export function DefaultVaultHeaderControl(props: DefaultVaultHeaderControlProps) {
  const { header, vaultId } = props
  //console.log('Rendering DefaultVaultHeaderControl', vaultId.toString())
  const { t } = useTranslation()
  const { vault$, ilkDataList$ } = useAppContext()
  const vaultDataWithError = useObservableWithError(vault$(vaultId))
  const ilksDataWithError = useObservableWithError(ilkDataList$)
  return (
    <WithLoadingIndicator
      variant="DefaultVaultHeaderControl"
      value={[vaultDataWithError.value, ilksDataWithError.value]}
      customLoader={<VaultContainerSpinner />}
    >
      {([vaultData, ilkDataList]) => {
        const ilk = ilkDataList.filter((x) => x.ilk === vaultData.ilk)[0]
        const translatedHeader = t(header, { ilk: ilk.ilk })

        const props: DefaultVaultHeaderLayoutProps = {
          id: vaultId,
          header: translatedHeader,
          debtFloor: ilk.debtFloor,
          liquidationPenalty: ilk.liquidationPenalty,
          liquidationRatio: ilk.liquidationRatio,
          stabilityFee: ilk.stabilityFee,
        }

        return <DefaultVaultHeaderLayout {...props} />
      }}
    </WithLoadingIndicator>
  )
}

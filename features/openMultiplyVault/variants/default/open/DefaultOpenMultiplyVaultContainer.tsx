import { useAppContext } from 'components/AppContextProvider'
import { usePresenter } from 'helpers/usePresenter'
import { memoize } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import {
  DefaultVaultHeader,
  DefaultVaultHeaderProps,
} from '../../../../../components/vault/DefaultVaultHeader'
import { OpenMultiplyVaultContainer } from '../../../common/OpenMultiplyVaultContainer'
import { OpenMultiplyVaultState } from '../../../openMultiplyVault'
import { DefaultOpenMultiplyVaultDetails } from './DefaultOpenMultiplyVaultDetails'
import { DefaultOpenMultiplyVaultForm } from './DefaultOpenMultiplyVaultForm'

export function DefaultOpenMultiplyVaultContainer(props: OpenMultiplyVaultState) {
  const { t } = useTranslation()

  const vaultHeaderProps = usePresenter(
    useAppContext().openMultiplyVault$(props.ilk),
    vaultHeaderPresenter,
  )

  if (!vaultHeaderProps) return null

  return (
    <OpenMultiplyVaultContainer
      header={
        <DefaultVaultHeader
          {...vaultHeaderProps}
          header={t('vault.open-vault', { ilk: props.ilk })}
        />
      }
      details={<DefaultOpenMultiplyVaultDetails {...props} />}
      form={<DefaultOpenMultiplyVaultForm {...props} />}
      clear={props.clear}
    />
  )
}

const vaultHeaderPresenter = memoize(
  (openMultiplyVault$: Observable<OpenMultiplyVaultState>): Observable<DefaultVaultHeaderProps> =>
    openMultiplyVault$.pipe(
      map((openMultiplyVaultState) => {
        return {
          header: 'unused',
          liquidationRatio: openMultiplyVaultState.ilkData.liquidationRatio,
          stabilityFee: openMultiplyVaultState.ilkData.stabilityFee,
          liquidationPenalty: openMultiplyVaultState.ilkData.liquidationPenalty,
          debtFloor: openMultiplyVaultState.ilkData.debtFloor,
        }
      }),
    ),
)

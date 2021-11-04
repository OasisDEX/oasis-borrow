import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

import { CommonVaultState } from '../../../helpers/types'
import { OpenMultiplyVaultState } from '../openMultiplyVault'

export function OpenMultiplyVaultContainer(
  props: OpenMultiplyVaultState & {
    details: (props: OpenMultiplyVaultState) => JSX.Element
    form: (props: OpenMultiplyVaultState) => JSX.Element
    header: (props: CommonVaultState & { header: string; id?: BigNumber }) => JSX.Element
  },
) {
  const { ilk, clear, details: Details, form: Form, header: Header } = props
  const { t } = useTranslation()

  useEffect(() => {
    return () => {
      clear()
    }
  }, [])

  return (
    <>
      <Header {...props} header={t('vault.open-vault', { ilk })} />
      <Grid variant="vaultContainer">
        <Box>
          <Details {...props} />
        </Box>
        <Box>
          <Form {...props} />
        </Box>
      </Grid>
    </>
  )
}

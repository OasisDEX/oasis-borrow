import { BigNumber } from 'bignumber.js'
import { AppLink } from 'components/Links'
import { Modal, ModalCloseIcon } from 'components/Modal'
import { ModalProps } from 'helpers/modalHook'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Divider, Grid, Text } from 'theme-ui'

interface Props {
  ilk: string
  token: string
  liquidationRatio: BigNumber
}
export function SelectVaultTypeModal({ ilk, token, liquidationRatio, close }: ModalProps<Props>) {
  const { t } = useTranslation()

  const exposureMultiplier = one.plus(one.div(liquidationRatio.minus(one))).toFixed(2)

  const maxBorrowAmount = new BigNumber(one.div(liquidationRatio).multipliedBy(100000)).toFixed(0)

  return (
    <Modal close={close} sx={{ maxWidth: '500px', margin: '0 auto', p: 0 }}>
      <ModalCloseIcon sx={{ top: '30px' }} close={close} />
      <Grid sx={{ px: 3, py: 4, mx: 1 }}>
        <Box>
          <Text variant="paragraph1" sx={{ fontWeight: 'semiBold', mb: 3 }}>
            {t('select-vault-type.header', { token })}
          </Text>
        </Box>
        <Box>
          <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 2 }}>
            {t('select-vault-type.multiply.header', { token })}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'text.muted', mb: '24px' }}>
            {t('select-vault-type.multiply.subtext', {
              exposureMultiplier,
              token,
            })}
          </Text>
          <AppLink
            variant="primary"
            href={`/vaults/open-multiply/${ilk}`}
            sx={{ display: 'block', textAlign: 'center', mb: 3 }}
          >
            {t('select-vault-type.multiply.button', { token })}
          </AppLink>
        </Box>
        <Divider />

        <Box>
          <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 2 }}>
            {t('select-vault-type.borrow.header', { token })}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'text.muted', mb: '24px' }}>
            {t('select-vault-type.borrow.subtext', {
              maxBorrow: maxBorrowAmount,
              token,
            })}
          </Text>
          <AppLink
            variant="primary"
            href={`/vaults/open/${ilk}`}
            sx={{ display: 'block', textAlign: 'center' }}
          >
            {t('select-vault-type.borrow.button', { token })}
          </AppLink>
        </Box>
      </Grid>
    </Modal>
  )
}

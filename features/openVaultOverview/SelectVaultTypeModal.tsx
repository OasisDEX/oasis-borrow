import { BigNumber } from 'bignumber.js'
import { AppLink } from 'components/Links'
import { Modal, ModalCloseIcon } from 'components/Modal'
import { ModalProps } from 'helpers/modalHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Divider, Grid, Text } from 'theme-ui'

interface Props {
  ilk: string
  token: string
  balance: BigNumber
}
export function SelectVaultTypeModal({ ilk, token, close, balance }: ModalProps<Props>) {
  const { t } = useTranslation()

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
              token,
              balance,
              exposure: balance.times(2),
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
              token,
              balance,
              maxBorrow: balance.times(1000),
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

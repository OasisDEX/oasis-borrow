import { AppLink } from 'components/Links'
import { Modal, ModalCloseIcon } from 'components/Modal'
import { ModalProps } from 'helpers/modalHook'
import React from 'react'
import { Box, Text, Grid } from 'theme-ui'

interface Props {
  ilk: string
}
export function SelectVaultTypeModal(props: ModalProps<Props>) {
  return (
    <Modal close={props.close} sx={{ maxWidth: '464px', margin: '0px auto' }}>
      <ModalCloseIcon close={props.close} />
      <Grid sx={{ px: 3, py: 4 }}>
        <Box>
          <Text variant="paragraph1" sx={{ fontWeight: 'semiBold' }}>
            What do you want to do with your ETH vault?
          </Text>
        </Box>
        <Box>
          <AppLink variant="primary" href={`/vaults/leverage/${props.ilk}`}>
            Leverage
          </AppLink>
        </Box>
        <Box>
          <AppLink variant="primary" href={`/vaults/open/${props.ilk}`}>
            Borrow
          </AppLink>
        </Box>
      </Grid>
    </Modal>
  )
}

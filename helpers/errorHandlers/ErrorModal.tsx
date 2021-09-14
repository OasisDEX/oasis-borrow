import { Modal, ModalCloseIcon } from 'components/Modal'
import { ModalProps } from 'helpers/modalHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Grid, Heading } from 'theme-ui'

export function ErrorModal({ close, error }: ModalProps & { error: string }) {
  const { t } = useTranslation()

  const [showResults, setShowResults] = React.useState(false)
  const onClickReload: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    window.location.reload()
  }
  const onClickDetails: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    setShowResults(!showResults)
  }
  return (
    <Modal close={close}>
      <ModalCloseIcon {...{ close }} />
      <Grid gap={4} sx={{ justifyContent: 'center', textAlign: 'center', mt: 5, mx: 'auto' }}>
        <Heading>{t('error-message')}</Heading>
        <Button onClick={onClickDetails} sx={{ maxWidth: 300, mx: 'auto', zIndex: 1 }}>
          {t('error-button-reload')}
        </Button>
        <Button onClick={onClickReload} sx={{ maxWidth: 300, mx: 'auto', zIndex: 1 }}>
          {t('error-button-reload')}
        </Button>
        <Box sx={{ justifyContent: 'center', textAlign: 'center', wordWrap: 'break-word' }}>
          {showResults
            ? Array.isArray(error)
              ? error.map((el, i) => <Box key={i}>{el ? el.message || 'Error' : null}</Box>)
              : error
            : null}
        </Box>
      </Grid>
    </Modal>
  )
}

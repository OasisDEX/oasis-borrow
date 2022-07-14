import { Modal } from 'components/Modal'
import { ModalProps } from 'helpers/modalHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Flex, Grid, Heading, Text } from 'theme-ui'

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
    <Modal close={close} sx={{ maxWidth: '450px', margin: '0px auto' }}>
      <Flex
        p={3}
        sx={{
          minHeight: '300px',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'space-between',
          px: 3,
        }}
      >
        <Grid gap={3}>
          <Box px={2}>
            <Heading sx={{ textAlign: 'center', pb: 1, pt: 3, fontSize: 7 }}>
              {t('error-header')}
            </Heading>
            <Text mt={3} sx={{ fontWeight: '400', fontSize: '14px', justifySelf: 'center' }}>
              {t('error-message')}
            </Text>
          </Box>
          <Button
            variant="primary"
            sx={{ width: '80%', justifySelf: 'center', mt: 2 }}
            onClick={onClickReload}
          >
            {' '}
            {t('error-button-reload')}
          </Button>
          <Button
            variant="textual"
            sx={{ width: '80%', justifySelf: 'center', color: 'neutral80' }}
            onClick={onClickDetails}
          >
            {t('error-button')}
          </Button>
          <Box sx={{ justifyContent: 'center', textAlign: 'center', wordWrap: 'break-word' }}>
            {showResults
              ? Array.isArray(error)
                ? error.map((el, i) => <Box key={i}>{el ? el.message || 'Error' : null}</Box>)
                : error
              : null}
          </Box>
        </Grid>
      </Flex>
    </Modal>
  )
}

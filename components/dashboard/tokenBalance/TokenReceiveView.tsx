import { ModalBottom, ModalButton } from 'components/Modal'
import { ModalProps } from 'helpers/modalHook'
import { useTranslation } from 'i18n'
import QRCode from 'qrcode.react'
import React, { useEffect, useRef, useState } from 'react'
import { Grid, Heading, Text } from 'theme-ui'

interface TokenReceiveViewProps extends ModalProps {
  account: string
}

const TIMEOUT = 1000

// For QR code:
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-831.md

export function TokenReceiveView({ close, account }: TokenReceiveViewProps) {
  const { t } = useTranslation('common')
  const timeoutRef = useRef<any>()
  const defaultButtonText = t('copy-address')
  const [buttonText, setButtonText] = useState<string>(defaultButtonText)

  async function handleCopyToClipboard() {
    await navigator.clipboard.writeText(account)
    setButtonText(t('copied'))
    timeoutRef.current = setTimeout(() => setButtonText(defaultButtonText), TIMEOUT)
  }

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    [],
  )

  return (
    <ModalBottom {...{ close }}>
      <Grid sx={{ justifyItems: 'center' }} gap={4}>
        <Heading>{t('receive')}</Heading>

        <QRCode value={`ethereum:${account}`} renderAs="svg" size={178} />

        <Grid bg="background" sx={{ borderRadius: 'large', overflowWrap: 'break-word' }}>
          <Text py={3} px={4} sx={{ fontSize: 4, color: 'textAlt', textAlign: 'center' }}>
            {account}
          </Text>
        </Grid>
      </Grid>

      <ModalButton onClick={handleCopyToClipboard}>{buttonText}</ModalButton>
    </ModalBottom>
  )
}

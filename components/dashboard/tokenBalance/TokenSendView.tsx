// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { TokenConfig } from 'components/blockchain/config'
import { CardBalance } from 'components/Cards'
import { GasCost } from 'components/GasCost'
import { ModalBackIcon, ModalBottom, ModalButton } from 'components/Modal'
import { formatAddress, formatCryptoBalance } from 'helpers/formatters/format'
import { InputWithMax, InputWithSuffix } from 'helpers/input'
import { AppSpinner } from 'helpers/loadingIndicator/LoadingIndicator'
import { ModalProps } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'i18n'
import jsQR from 'jsqr'
import { TFunction } from 'next-i18next'
import React, { useEffect, useRef, useState } from 'react'
import { Box, Button, Flex, Grid, Heading, Input, Text } from 'theme-ui'
import Web3 from 'web3'

import { trackingEvents } from '../../analytics/analytics'
import { useAppContext } from '../../AppContextProvider'
import { ManualChange } from '../dsrPot/dsrDeposit'
import { AddressChange, TokenSendMessage, TokenSendState } from '../tokenSend'

function handleAmountChange(change: (ch: ManualChange) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '')
    change({
      kind: 'amount',
      amount: value === '' ? undefined : new BigNumber(value),
    })
  }
}

function parseMessageErrors(message: TokenSendMessage, t: TFunction, token: TokenConfig) {
  switch (message.kind) {
    case 'addressInvalid':
      return t('address-invalid')
    case 'amountIsEmpty':
      return t('send-amount-empty', { token: token.symbol })
    case 'amountMoreThanBalance':
      return t('send-amount-exceed-balance', { token: token.symbol })
    default:
      return message.kind
  }
}

interface SendViewProps extends TokenSendState {
  token: TokenConfig
  close: () => void
}

function ReadingQrCode({ reset, change, messages, address, token }: SendViewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasCamera, setHasCamera] = useState(true)

  const req = useRef<number>(0)
  const { t } = useTranslation('common')

  const addressMessages = messages
    .filter((m) => m.kind === 'addressInvalid')
    .map((m) => parseMessageErrors(m, t, token))

  const hasAddressErrors = addressMessages.length > 0 && !!address

  useEffect(() => {
    if (!hasAddressErrors && address) reset!()
  }, [address])

  let stream: any
  let isCancelled = false

  useEffect(() => {
    async function readQrCode() {
      const video = document.createElement('video') as HTMLVideoElement
      const canvasElement = document.getElementById('canvas') as HTMLCanvasElement
      const containerElement = document.getElementById('qrcode-container')?.getBoundingClientRect()
      const canvas = canvasElement.getContext('2d')

      function tick() {
        if (video.readyState === video.HAVE_ENOUGH_DATA && containerElement && canvas) {
          canvasElement.hidden = false

          canvasElement.height = video.videoHeight
          canvasElement.width = containerElement.width

          const sx = (video.videoWidth - containerElement.width) / 2

          canvas.drawImage(
            video,
            sx,
            0,
            canvasElement.width,
            canvasElement.height,
            0,
            0,
            containerElement.width,
            video.videoHeight,
          )
          const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          })
          if (code && !isCancelled) {
            let qrAddress
            if (/^ethereum:(0x[0-9a-f,A-F]{40})(.)*/.test(code.data)) {
              qrAddress = code.data.split(':')[1].slice(0, 42)
            } else if (Web3.utils.isAddress(code.data)) {
              qrAddress = code.data
            }
            change!({
              kind: 'address',
              address: qrAddress,
            })
          }
        }
        if (!isCancelled) {
          req.current = requestAnimationFrame(tick)
        }
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })

        video.srcObject = stream
        video.setAttribute('playsinline', 'true')
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        video.play()
        req.current = requestAnimationFrame(tick)
        if (!isCancelled) {
          setIsLoading(false)
        }
      } catch (err) {
        if (!isCancelled) {
          setHasCamera(false)
          setIsLoading(false)
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    readQrCode()

    return () => {
      isCancelled = true
      cancelAnimationFrame(req.current)
      stream?.getTracks().forEach((track: MediaStreamTrack) => {
        if (track.readyState === 'live') {
          track.stop()
        }
      })
    }
  }, [])

  return (
    <Grid sx={{ justifyItems: 'center', minHeight: '350px', width: '100%' }} mb={4}>
      <Heading>{t('send')}</Heading>
      {isLoading ? <AppSpinner size={35} /> : null}
      {!hasCamera ? (
        <>
          <Icon name="warning" size={70} sx={{ color: 'onWarning' }} />
          <Text variant="smallHeading">{t('no-camera')}</Text>
        </>
      ) : null}
      <Grid
        id="qrcode-container"
        p={0}
        m={0}
        sx={{
          width: '100%',
          borderRadius: 'roundish',
          overflow: 'hidden',
        }}
      >
        <canvas id="canvas" hidden></canvas>
      </Grid>
    </Grid>
  )
}

function Editing({
  stage,
  change,
  address,
  messages,
  token,
  dai,
  eth,
  amount,
  showQrCode,
}: SendViewProps) {
  const [isEditing, setIsEditing] = useState(false)

  const { t } = useTranslation('common')

  const balance = token.symbol === 'DAI' ? dai : eth

  const addressMessages = messages
    .filter((m) => m.kind === 'addressInvalid')
    .map((m) => parseMessageErrors(m, t, token))

  const amountMessages = messages
    .filter((m) => m.kind !== 'addressInvalid')
    .map((m) => parseMessageErrors(m, t, token))

  function handleAddressChange(change: (ch: AddressChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      change({
        kind: 'address',
        address: value === '' ? undefined : value,
      })
    }
  }

  function handlePasteFromClipboard(change: (ch: AddressChange) => void) {
    return () =>
      navigator.clipboard.readText().then((value) => {
        change({
          kind: 'address',
          address: value === '' ? undefined : value,
        })
      })
  }

  function handleQrCodeView(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    showQrCode!()
  }

  function handleSetMax(change: (ch: ManualChange) => void) {
    return () => {
      change({ kind: 'amount', amount: balance })
    }
  }

  const displayAddress = !address
    ? ''
    : Web3.utils.isAddress(address)
    ? formatAddress(address)
    : address

  const hasAddressErrors = addressMessages.length > 0 && !!address
  const hasAmountErrors = amountMessages.length > 0 && !!amount

  return (
    <Grid sx={{ justifyItems: 'center' }} gap={4}>
      <Heading>{t('send')}</Heading>
      <Grid gap={2} sx={{ width: '100%' }}>
        <Heading variant="smallHeading">{t('address')}</Heading>
        <InputWithSuffix
          input={
            <Input
              type="text"
              disabled={stage !== 'editing'}
              onChange={isEditing ? handleAddressChange(change!) : undefined}
              onBlur={() => setIsEditing(false)}
              onFocus={() => setIsEditing(true)}
              value={isEditing ? address : displayAddress}
              placeholder={t('send-to')}
              sx={{ pr: 6 }}
              variant={hasAddressErrors ? 'inputError' : 'input'}
            />
          }
          suffix={
            <Flex>
              <Button onClick={handlePasteFromClipboard(change!)} variant="secondary" mr={3} p={1}>
                <Icon name="paste" size={25} />
              </Button>
              <Button onClick={handleQrCodeView} variant="secondary" p={1}>
                <Icon name="qrcode" size={25} />
              </Button>
            </Flex>
          }
        />
        {hasAddressErrors ? <Text variant="error">{addressMessages.join(',')}</Text> : null}
      </Grid>
      <Grid gap={3} sx={{ width: '100%' }}>
        <Grid gap={2} sx={{ width: '100%' }}>
          <Heading variant="smallHeading">{t('amount')}</Heading>
          <InputWithMax
            {...{
              amount,
              token,
              disabled: stage !== 'editing',
              hasError: hasAmountErrors,
              onChange: handleAmountChange(change!),
              onSetMax: handleSetMax(change!),
            }}
          />
          {hasAmountErrors ? <Text variant="error">{amountMessages.join(',')}</Text> : null}
        </Grid>
        <CardBalance token={token.symbol} icon={token.icon} balance={balance} />
      </Grid>
    </Grid>
  )
}

function Confirmation({
  amount,
  token,
  address,
  gasEstimationStatus,
  gasEstimationDai,
  gasEstimationEth,
}: SendViewProps) {
  const { t } = useTranslation('common')

  return (
    <Grid gap={4}>
      <Heading sx={{ textAlign: 'center' }}>{t('confirm')}</Heading>
      <Grid gap={3} px={3}>
        <Heading variant="smallHeading">{t('you-are-sending')}</Heading>
        <Flex sx={{ alignItems: 'center', mb: 3 }}>
          <Icon name={token.icon} size={24} />
          <Text sx={{ ml: 2, fontSize: 6 }}>{formatCryptoBalance(amount!)}</Text>
        </Flex>
        <Heading variant="smallHeading">{t('to-the-following-address')}</Heading>
        <Grid bg="background" sx={{ borderRadius: 'large', overflowWrap: 'break-word' }}>
          <Text py={3} px={4} sx={{ fontSize: 4, color: 'textAlt', textAlign: 'center' }}>
            {address}
          </Text>
        </Grid>
        <Box sx={{ my: 3 }}>
          <GasCost {...{ gasEstimationStatus, gasEstimationDai, gasEstimationEth }} />
        </Box>
      </Grid>
    </Grid>
  )
}

export function SendView(props: SendViewProps) {
  const { t } = useTranslation('common')
  const { stage, token, sendDai, sendEth, close, proceed, canProceed, activeToken, change } = props
  useEffect(() => {
    if (change && activeToken !== token.symbol) {
      change({
        kind: 'activeToken',
        activeToken: token.symbol,
      })
    }
  }, [token])

  const send = token.symbol === 'DAI' ? sendDai : sendEth

  const proceedAction = () => {
    proceed && proceed()
    trackingEvents.tokenSendProceed()
  }

  const modalButtonAction =
    stage === 'editing'
      ? proceedAction
      : stage === 'sendWaiting4Confirmation'
      ? () => {
          send!()
          close!()
        }
      : undefined

  const modalButtonContent =
    stage === 'editing' ? t('continue') : stage === 'sendWaiting4Confirmation' ? t('confirm') : ''

  return (
    <>
      {props.stage === 'editing' ? (
        <Editing {...props} />
      ) : props.stage === 'readingQrCode' ? (
        <ReadingQrCode {...props} />
      ) : (
        <Confirmation {...props} />
      )}
      {modalButtonContent !== '' ? (
        <ModalButton onClick={modalButtonAction} disabled={!canProceed}>
          {modalButtonContent}
        </ModalButton>
      ) : null}
    </>
  )
}

interface TokenSendViewProps {
  token: TokenConfig
}
export function TokenSendView({ token, close }: ModalProps<TokenSendViewProps>) {
  const { tokenSend$ } = useAppContext()
  const tokenSend = useObservable(tokenSend$)

  if (!tokenSend) return null

  return (
    <ModalBottom {...{ close }}>
      {tokenSend.stage === 'sendWaiting4Confirmation' || tokenSend.stage === 'readingQrCode' ? (
        <ModalBackIcon back={tokenSend.reset!} />
      ) : null}
      <SendView {...tokenSend} token={token} close={close} />
    </ModalBottom>
  )
}

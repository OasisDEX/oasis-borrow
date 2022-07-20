import { Icon } from '@makerdao/dai-ui-icons'
import { useAppContext } from 'components/AppContextProvider'
import { disconnect } from 'components/connectWallet/ConnectWallet'
import { AppLink } from 'components/Links'
import { Modal, ModalErrorMessage } from 'components/Modal'
import { NewReferralModal } from 'features/referralOverview/NewReferralModal'
import { UserReferralState } from 'features/referralOverview/user'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import getConfig from 'next/config'
import React, { ReactNode, useState } from 'react'
import { Box, Button, Flex, Grid, Heading, Label, Text } from 'theme-ui'
import { fadeIn } from 'theme/keyframes'

import { TermsAcceptanceStage, TermsAcceptanceState } from './termsAcceptance'

interface WithTermsOfServiceProps {
  children: ReactNode
}

function getStageErrorMessage(stage: TermsAcceptanceStage) {
  switch (stage) {
    case 'acceptanceCheckFailed':
      return 'acceptance-check-failed'
    case 'acceptanceSaveFailed':
      return 'acceptance-save-failed'
    case 'jwtAuthFailed':
      return 'jwt-auth-failed'
    case 'jwtAuthRejected':
      return 'jwt-auth-rejected'
    default:
      return ''
  }
}

function getButtonMessage(stage: TermsAcceptanceStage) {
  switch (stage) {
    case 'jwtAuthInProgress':
      return 'jwt-auth-in-progress'
    case 'acceptanceSaveInProgress':
      return 'acceptance-save-in-progress'
    default:
      return 'jwt-auth-waiting-acceptance'
  }
}

function TOSWaiting4Signature({
  stage,
  acceptJwtAuth,
  updated,
  disconnect,
}: TermsAcceptanceState & { disconnect: () => void }) {
  const { t } = useTranslation()

  return (
    <Grid gap={3}>
      <Box px={2}>
        <Heading sx={{ textAlign: 'center', pb: 1, pt: 3, fontSize: 7 }}>
          {t(`tos-welcome${updated ? '-updated' : ''}`)}
        </Heading>
        <Text mt={3} sx={{ fontWeight: '400', fontSize: '14px' }}>
          {t('tos-jwt-signature-message')}
        </Text>
      </Box>
      <Button
        sx={{ width: '80%', justifySelf: 'center' }}
        disabled={stage !== 'jwtAuthWaiting4Acceptance'}
        onClick={acceptJwtAuth}
      >
        {t(getButtonMessage(stage))}
      </Button>
      <Button variant="textual" sx={{ width: '80%', justifySelf: 'center' }} onClick={disconnect}>
        {t('disconnect')}
      </Button>
    </Grid>
  )
}

function TOSWaiting4Acceptance({ stage, acceptTOS, updated }: TermsAcceptanceState) {
  const [checked, setChecked] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <Box px={3}>
        <Heading sx={{ textAlign: 'center', pb: 1, pt: 3, fontSize: 7 }}>
          {t(`tos-welcome${updated ? '-updated' : ''}`)}
        </Heading>
        <Text sx={{ mt: 3, fontSize: '14px', textAlign: 'justify' }}>
          {t(`tos-accept-message${updated ? '-updated' : ''}`)}
        </Text>
        <AppLink
          href="/terms"
          withAccountPrefix={false}
          internalInNewTab
          passHref
          sx={{
            display: 'flex',
            mt: 2,
            mb: 4,
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}
        >
          <Text mt={3}>{t('tos-view')}</Text>
        </AppLink>
        <Box px={2} sx={{ background: 'neutral30', borderRadius: '12px', p: 3, mb: 4 }}>
          <Label
            sx={{ fontSize: 3, fontWeight: 'body', cursor: 'pointer' }}
            onClick={() => setChecked(!checked)}
          >
            <Flex
              sx={{
                position: 'relative',
                top: '8px',
                width: '25px',
                height: '25px',
                border: 'light',
                borderColor: 'success100',
                borderRadius: 'small',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background ease-in 0.2s',
                ...(checked && {
                  bg: 'success10',
                }),
              }}
            >
              {checked && (
                <Icon sx={{ animation: `${fadeIn} 0.2s` }} name="checkmark" color="success100" />
              )}
            </Flex>
            <Text ml={3} sx={{ flex: 1, fontWeight: '400', fontSize: '14px' }}>
              {t('tos-read')}
            </Text>
          </Label>
        </Box>
      </Box>
      <Button
        sx={{ width: '80%' }}
        disabled={!checked || stage !== 'acceptanceWaiting4TOSAcceptance'}
        onClick={acceptTOS}
      >
        {t('continue')}
      </Button>
    </>
  )
}

function TOSErrorScreen({
  tryAgain,
  message,
}: TermsAcceptanceState & {
  message: string
}) {
  const { t } = useTranslation()

  return (
    <>
      <ModalErrorMessage {...{ message }} />
      <Button sx={{ width: '80%' }} onClick={tryAgain}>
        {t('try-again')}
      </Button>
    </>
  )
}

const hiddenStages: TermsAcceptanceStage[] = [
  'acceptanceAccepted',
  'walletConnectionInProgress',
  'acceptanceCheckInProgress',
]

export function TermsOfService({ userReferral }: { userReferral?: UserReferralState }) {
  const { web3Context$, termsAcceptance$ } = useAppContext()
  const [termsAcceptance] = useObservable(termsAcceptance$)
  const [web3Context] = useObservable(web3Context$)

  function disconnectHandler() {
    disconnect(web3Context)
  }

  if (
    userReferral?.state === 'newUser' &&
    userReferral?.referrer &&
    web3Context?.status === 'connected' &&
    termsAcceptance?.stage === 'acceptanceAccepted'
  )
    return (
      <NewReferralModal
        account={web3Context.account}
        userReferral={userReferral}
      ></NewReferralModal>
    )

  if (!termsAcceptance || hiddenStages.includes(termsAcceptance.stage)) return null

  return (
    <Modal sx={{ maxWidth: '400px', margin: '0px auto' }}>
      <Flex
        p={3}
        sx={{
          minHeight: termsAcceptance.updated ? '400px' : '290px',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'space-between',
          px: 3,
        }}
      >
        {(() => {
          switch (termsAcceptance.stage) {
            case 'acceptanceWaiting4TOSAcceptance':
              return <TOSWaiting4Acceptance {...termsAcceptance} />
            case 'jwtAuthWaiting4Acceptance':
            case 'jwtAuthInProgress':
            case 'acceptanceSaveInProgress':
              return <TOSWaiting4Signature {...termsAcceptance} disconnect={disconnectHandler} />
            case 'acceptanceCheckFailed':
            case 'jwtAuthFailed':
            case 'jwtAuthRejected':
            case 'acceptanceSaveFailed':
              return (
                <TOSErrorScreen
                  {...{ ...termsAcceptance, message: getStageErrorMessage(termsAcceptance.stage) }}
                />
              )
            default:
              return null
          }
        })()}
      </Flex>
    </Modal>
  )
}

export function WithTermsOfService({ children }: WithTermsOfServiceProps) {
  const { web3ContextConnected$, userReferral$ } = useAppContext()
  const [web3ContextConnected] = useObservable(web3ContextConnected$)
  const [userReferral] = useObservable(userReferral$)

  const shouldUseTermsOfService = getConfig()?.publicRuntimeConfig?.useTermsOfService

  if (!web3ContextConnected) {
    return null
  }

  if (web3ContextConnected.status === 'connectedReadonly' || !shouldUseTermsOfService) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <TermsOfService userReferral={userReferral} />
    </>
  )
}

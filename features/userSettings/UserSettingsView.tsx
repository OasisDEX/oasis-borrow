import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { disconnect, getConnectionDetails, getWalletKind } from 'components/connectWallet/ConnectWallet'
import { MobileSidePanelClose, MobileSidePanelPortal } from 'components/Modal'
import { formatAddress, formatCryptoBalance } from 'helpers/formatters/format'
import { AccountIndicator } from 'features/account/Account'
import { AppSpinner } from 'helpers/AppSpinner'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatPercent, formatPrecision } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React, { ChangeEvent, useRef, useState } from 'react'
import { useEffect } from 'react'
import { createNumberMask } from 'text-mask-addons'
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Link as ThemeLink,
  SxStyleProp,
  Text,
  Textarea,
} from 'theme-ui'
import { UnreachableCaseError } from 'ts-essentials'

import {
  SLIPPAGE_OPTIONS,
  UserSettingsErrorMessages,
  UserSettingsState,
  UserSettingsWarningMessages,
} from './userSettings'
import { AppLink } from 'components/Links'

function SlippageOptionButton({
  option,
  onClick,
  active,
}: {
  option: BigNumber
  onClick: () => void
  active: boolean
}) {
  return (
    <Button
      variant="outlineSquare"
      sx={{
        fontSize: 1,
        fontWeight: 'semiBold',
        mr: '6px',
        cursor: 'pointer',
        '&:last-child': { mr: '0px' },
        '&:hover': {
          borderColor: 'primary',
          boxShadow: 'userSettingsOptionButton',
        },
        ...(active && {
          borderColor: 'primary',
          boxShadow: 'userSettingsOptionButton',
        }),
      }}
      onClick={onClick}
    >
      {formatPercent(option.times(100), { precision: 2 })}
    </Button>
  )
}

const validationMessageStyles: SxStyleProp = {
  fontWeight: 'semiBold',
  fontSize: 2,
}

const saveStatusMessageStyles: SxStyleProp = {
  fontWeight: 'semiBold',
  fontSize: 2,
  textAlign: 'center',
  mt: 3,
}

function getSlippageLimitMessageTranslation(
  message: UserSettingsErrorMessages | UserSettingsWarningMessages,
) {
  switch (message) {
    case 'invalidSlippage':
      return 'user-settings.slippage-limit.errors.invalid-slippage'
    case 'highSlippage':
      return 'user-settings.slippage-limit.warnings.high-slippage'
    default:
      throw new UnreachableCaseError(message)
  }
}

function SlippageLimitMessages({
  errors,
  warnings,
}: Pick<UserSettingsState, 'errors' | 'warnings'>) {
  const { t } = useTranslation()

  return (
    <Grid gap={2} mb={2}>
      {warnings.map((message) => (
        <Text sx={{ ...validationMessageStyles, color: 'onWarning' }} key={message}>
          {t(getSlippageLimitMessageTranslation(message))}
        </Text>
      ))}
      {errors.map((message) => (
        <Text sx={{ ...validationMessageStyles, color: 'onError' }} key={message}>
          {t(getSlippageLimitMessageTranslation(message))}
        </Text>
      ))}
    </Grid>
  )
}

function SlippageSettingsForm() {
  const { userSettings$  } = useAppContext()
  const [userSettings] = useObservable(userSettings$)
  const { t } = useTranslation()
  const [customOpened, setCustomOpened] = useState(false)

  if (!userSettings) {
    return null
  }

  const { slippageInput, setSlippageInput, errors, warnings, slippage } = userSettings

  return (
    <Box>
      <Box>
        <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 2 }}>
          {t('user-settings.slippage-limit.preset-title')}
        </Text>
        <Text variant="paragraph3" sx={{ color: 'text.subtitle', mb: -1 }}>
          {t('user-settings.slippage-limit.preset-description')}
        </Text>
        <Link href="/support#using-multiply" passHref>
          <ThemeLink target="_self" sx={{ fontSize: 2, fontWeight: 'body', mt: -1 }}>
            {t('user-settings.slippage-limit.read-more')}
          </ThemeLink>
        </Link>
        <Text variant="paragraph4" sx={{ fontWeight: 'semiBold', my: 3 }}>
          Your current slippage: {formatPercent(slippage.times(100), { precision: 2 })}
        </Text>
        <Flex>
          {SLIPPAGE_OPTIONS.map((option) => (
            <SlippageOptionButton
              key={option.toFixed()}
              option={option}
              onClick={() => setSlippageInput(option)}
              active={slippageInput.eq(option)}
            />
          ))}
        </Flex>
      </Box>
      <Box my={3}>
        <Flex
          sx={{ color: 'primaryEmphasis', cursor: 'pointer' }}
          onClick={() => setCustomOpened(!customOpened)}
        >
          <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', color: 'inherit' }}>
            {t('user-settings.slippage-limit.custom-title')}
          </Text>
          <Icon
            size="auto"
            width="12"
            height="7"
            name={customOpened ? 'chevron_up' : 'chevron_down'}
            sx={{ ml: '6px', position: 'relative', top: '1px' }}
          />
        </Flex>
        {customOpened && (
          <Card sx={{ mt: 3, borderRadius: 'mediumLarge' }}>
            <Grid px={2} gap={2}>
              <Text variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
                {t('user-settings.slippage-limit.custom-label')}
              </Text>
              <BigNumberInput
                type="text"
                mask={createNumberMask({
                  allowDecimal: true,
                  prefix: '',
                })}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSlippageInput(new BigNumber(e.target.value).div(100))
                }
                value={slippageInput ? formatPrecision(slippageInput.times(100), 2) : undefined}
                sx={{ variant: 'forms.inputSecondary' }}
              />
            </Grid>
          </Card>
        )}
      </Box>
      <SlippageLimitMessages {...{ errors, warnings }} />
    </Box>
  )
}

function WalletInfo() {
  const { accountData$, web3Context$ } = useAppContext()
  const [accountData] = useObservable(accountData$)
  const [web3Context] = useObservable(web3Context$)
  const clipboardContentRef = useRef<HTMLTextAreaElement>(null)
  
  const { t } = useTranslation()

  function copyToClipboard() {
    const clipboardContent = clipboardContentRef.current

    if (clipboardContent) {
      clipboardContent.select()
      document.execCommand('copy')
    }
  }

  if (web3Context?.status !== 'connected') return null

  const { account, connectionKind } = web3Context
  const { userIcon } = getConnectionDetails(getWalletKind(connectionKind))

  return (
    <Grid>
      <Flex sx={{ alignItems: 'center' }}>
        <Icon name={userIcon!} />
        <Text sx={{ fontSize: 5, mx: 1 }}>{formatAddress(account)}</Text>
        <Text onClick={() => copyToClipboard()}>{t('copy')}</Text>
        {/* Textarea element used for copy to clipboard using native API, custom positioning outside of screen */}
        <Textarea
          ref={clipboardContentRef}
          sx={{ position: 'absolute', top: '-1000px', left: '-1000px' }}
          value={account}
          readOnly
        />
      </Flex>
      {accountData &&
        <Flex>
          <Icon sx={{ zIndex: 1 }} name="dai_circle_color" size={[24, 30]} />
          <Box sx={{ mx: 2, color: 'onWarning' }}>
            {accountData.daiBalance ? formatCryptoBalance(accountData.daiBalance) : '0.00'}
          </Box>
        </Flex>
     }
    </Grid>
  )
}

export function UserSettings() {
  const { userSettings$  } = useAppContext()
  const [userSettings] = useObservable(userSettings$)
  const { t } = useTranslation()
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)

  if (!userSettings) {
    return null
  }

  const {
    slippage,
    slippageInput,
    stage,
    saveSettings,
    canProgress,
  } = userSettings

  return <Box>
      <WalletInfo />
      <SlippageSettingsForm />
      {/* Gas settings will go here */}
      {!slippage.eq(slippageInput) && (
        <Button
          disabled={!canProgress || stage === 'inProgress'}
          onClick={saveSettings}
          sx={{ mt: 2, width: '100%' }}
        >
          <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
            {stage === 'inProgress' && (
              <AppSpinner
                variant="styles.spinner.large"
                sx={{ color: 'surface', display: 'flex', mr: 2 }}
              />
            )}
            <Text>
              {stage === 'inProgress'
                ? t('user-settings.button-in-progress')
                : t('user-settings.button')}
            </Text>
          </Flex>
        </Button>
      )}
      {stage === 'success' && (
        <Text sx={{ ...saveStatusMessageStyles, color: 'onSuccess' }}>
          {t('user-settings.update-success')}
        </Text>
      )}
      {stage === 'failure' && (
        <Text sx={{ ...saveStatusMessageStyles, color: 'onError' }}>
          {t('user-settings.update-failure')}
        </Text>
      )}
      <Button
        variant="textual"
        sx={{
          textAlign: 'left',
          p: 0,
          verticalAlign: 'baseline',
        }}
        onClick={() => disconnect(web3Context)}
      >
        {t('disconnect')}
      </Button>
      <Flex
        sx={{
          fontWeight: 'semiBold',
          px: 3,
          my: 3,
          py: 1,
          mx: 1,
        }}
      >
        <AppLink
          sx={{ color: 'primary', mr: 3 }}
          withAccountPrefix={false}
          href="/terms"
          onClick={close}
        >
          {t('account-terms')}
        </AppLink>
        <AppLink
          sx={{ color: 'primary', mr: 3 }}
          withAccountPrefix={false}
          href="/privacy"
          onClick={close}
        >
          {t('account-privacy')}
        </AppLink>
        <AppLink
          sx={{ color: 'primary' }}
          withAccountPrefix={false}
          href="/support"
          onClick={close}
        >
          {t('account-support')}
        </AppLink>
      </Flex>
  </Box>
}

export function UserSettingsButtonContents() {
  const { accountData$, context$, web3Context$ } = useAppContext()
  const [context] = useObservable(context$)
  const [accountData] = useObservable(accountData$)
  const [web3Context] = useObservable(web3Context$)

  if (!context || context.status === 'connectedReadonly' || !accountData || web3Context?.status !== 'connected')
    return null

  const { connectionKind } = web3Context
  const { userIcon } = getConnectionDetails(getWalletKind(connectionKind))

  return <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3 }}>
    <Flex>
      <Icon name={userIcon!} />
      <Text>
        <AccountIndicator address={context.account} ensName={accountData.ensName} />
      </Text>
    </Flex>
    <Icon
      size="auto"
      width="16"
      height="16"
      name="settings"
      sx={{ flexShrink: 0 }}
    />
  </Flex>
}

import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import {
  disconnect,
  getConnectionDetails,
  getWalletKind,
} from 'components/connectWallet/ConnectWallet'
import { AppLink } from 'components/Links'
import { useSocket } from 'components/NotificationSocketProvider'
import { AppSpinner } from 'helpers/AppSpinner'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAddress, formatCryptoBalance } from 'helpers/formatters/format'
import { formatPercent, formatPrecision } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React, { ChangeEvent, useRef, useState } from 'react'
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
          borderColor: 'primary100',
          boxShadow: 'userSettingsOptionButton',
        },
        ...(active && {
          borderColor: 'primary100',
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
        <Text sx={{ ...validationMessageStyles, color: 'warning' }} key={message}>
          {t(getSlippageLimitMessageTranslation(message))}
        </Text>
      ))}
      {errors.map((message) => (
        <Text sx={{ ...validationMessageStyles, color: 'critical100' }} key={message}>
          {t(getSlippageLimitMessageTranslation(message))}
        </Text>
      ))}
    </Grid>
  )
}

function SlippageSettingsForm() {
  const { userSettings$ } = useAppContext()
  const [userSettings] = useObservable(userSettings$)
  const { t } = useTranslation()
  const [customOpened, setCustomOpened] = useState(false)

  if (!userSettings) {
    return null
  }

  const {
    slippage,
    slippageInput,
    setSlippageInput,
    errors,
    warnings,
    stage,
    saveSettings,
    canProgress,
  } = userSettings

  return (
    <>
      <Box>
        <Box>
          <Text variant="paragraph3" sx={{ color: 'neutral80', mb: -1 }}>
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
            sx={{ color: 'primary60', cursor: 'pointer' }}
            onClick={() => setCustomOpened(!customOpened)}
          >
            <Text variant="paragraph3" sx={{ fontWeight: 'medium', color: 'inherit' }}>
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
                <Text variant="paragraph3" sx={{ fontWeight: 'medium' }}>
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
                sx={{ color: 'neutral10', display: 'flex', mr: 2 }}
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
        <Text sx={{ ...saveStatusMessageStyles, color: 'success' }}>
          {t('user-settings.update-success')}
        </Text>
      )}
      {stage === 'failure' && (
        <Text sx={{ ...saveStatusMessageStyles, color: 'critical100' }}>
          {t('user-settings.update-failure')}
        </Text>
      )}
    </>
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
        <Icon name={userIcon!} size={32} sx={{ mr: 2, flexShrink: 0 }} />
        <Grid sx={{ gap: 0, width: '100%' }}>
          <Flex sx={{ justifyContent: 'space-between' }}>
            <Text variant="address" sx={{ fontSize: 2 }}>
              {formatAddress(account, 6)}
            </Text>
            <Text
              sx={{
                color: 'interactive100',
                fontSize: 1,
                cursor: 'pointer',
                fontWeight: 'semiBold',
              }}
              onClick={() => copyToClipboard()}
            >
              {t('copy')}
            </Text>
            {/* Textarea element used for copy to clipboard using native API, custom positioning outside of screen */}
            <Textarea
              ref={clipboardContentRef}
              sx={{ position: 'absolute', top: '-1000px', left: '-1000px' }}
              value={account}
              readOnly
            />
          </Flex>
          <Flex>
            {accountData && accountData.daiBalance && (
              <>
                <Icon sx={{ zIndex: 1 }} name="dai_color" size={16} />
                <Text variant="caption" sx={{ ml: 1, color: 'neutral80' }}>
                  {formatCryptoBalance(accountData.daiBalance)}
                </Text>
              </>
            )}
          </Flex>
        </Grid>
      </Flex>
    </Grid>
  )
}

export function UserSettings({ sx }: { sx?: SxStyleProp }) {
  const { t } = useTranslation()
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)
  const { socket } = useSocket()

  return (
    <Box sx={sx}>
      <Text variant="headerSettings" sx={{ mb: 3 }}>
        {t('wallet')}
      </Text>
      <WalletInfo />
      <Text variant="headerSettings" sx={{ mt: 4, mb: 3 }}>
        {t('user-settings.slippage-limit.preset-title')}
      </Text>
      <SlippageSettingsForm />
      <Box sx={{ borderTop: '1px solid neutral30', mt: 3 }} />
      <Button
        variant="textual"
        sx={{
          p: 0,
          my: 16,
          display: 'flex',
          alignItems: 'center',
        }}
        onClick={() => {
          socket?.disconnect()
          disconnect(web3Context)
        }}
      >
        <Icon name="sign_out" color="primary60" size="auto" width={20} />
        <Text variant="paragraph3" sx={{ fontWeight: 'medium', color: 'primary60', ml: 2 }}>
          {t('disconnect-wallet')}
        </Text>
      </Button>
      <Flex
        sx={{
          px: 0,
          mt: 3,
          pb: 1,
          pt: 2,
        }}
      >
        <AppLink
          variant="settings"
          sx={{ mr: 3 }}
          withAccountPrefix={false}
          href="/terms"
          onClick={close}
        >
          {t('account-terms')}
        </AppLink>
        <AppLink
          variant="settings"
          sx={{ mr: 3 }}
          withAccountPrefix={false}
          href="/privacy"
          onClick={close}
        >
          {t('account-privacy')}
        </AppLink>
        <AppLink variant="settings" withAccountPrefix={false} href="/support" onClick={close}>
          {t('account-support')}
        </AppLink>
      </Flex>
    </Box>
  )
}

export function UserSettingsButtonContents({ context, accountData, web3Context, active }: any) {
  const { connectionKind } = web3Context
  const { userIcon } = getConnectionDetails(getWalletKind(connectionKind))

  return (
    <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Flex sx={{ alignItems: 'center' }}>
        <Icon name={userIcon!} size="auto" width="42" />
        <Text
          variant="address"
          sx={{ ml: 3, color: 'primary100', fontSize: 2, fontWeight: [600, 500] }}
        >
          {accountData.ensName || formatAddress(context.account, 6)}
        </Text>
      </Flex>
      <Flex sx={{ ml: 2 }}>
        <Icon
          size="auto"
          width="16"
          height="16"
          name="settings"
          sx={{ flexShrink: 0, m: '13px' }}
          color={active ? 'primary100' : 'inherit'}
        />
      </Flex>
    </Flex>
  )
}

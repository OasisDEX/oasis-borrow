import BigNumber from 'bignumber.js'
import type { ContextConnected } from 'blockchain/network.types'
import { BlockNativeAvatar } from 'components/BlockNativeAvatar'
import { useAccountContext } from 'components/context/AccountContextProvider'
import { useMainContext } from 'components/context/MainContextProvider'
import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import type { AccountDetails } from 'features/account/AccountData'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { AppSpinner } from 'helpers/AppSpinner'
import { BigNumberInput } from 'helpers/BigNumberInput'
import {
  formatAddress,
  formatCryptoBalance,
  formatPercent,
  formatPrecision,
} from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import type { ChangeEvent } from 'react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { chevron_down, chevron_up, dai_color, settings, sign_out } from 'theme/icons'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Button, Card, Flex, Grid, Heading, Link as ThemeLink, Text, Textarea } from 'theme-ui'
import { UnreachableCaseError } from 'ts-essentials'

import { SLIPPAGE_OPTIONS } from './userSettings.constants'
import type {
  UserSettingsErrorMessages,
  UserSettingsState,
  UserSettingsWarningMessages,
} from './userSettings.types'

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

const validationMessageStyles: ThemeUIStyleObject = {
  fontWeight: 'semiBold',
  fontSize: 2,
}

const saveStatusMessageStyles: ThemeUIStyleObject = {
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
  const { userSettings$ } = useAccountContext()
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
          <Text variant="paragraph3" as="p" sx={{ color: 'neutral80', mb: -1 }}>
            {t('user-settings.slippage-limit.preset-description')}{' '}
            <Link href={EXTERNAL_LINKS.KB.WHAT_IS_SLIPPAGE} passHref legacyBehavior>
              <ThemeLink target="_self" sx={{ mt: -1, fontWeight: 400 }}>
                {t('user-settings.slippage-limit.read-more')}
              </ThemeLink>
            </Link>
          </Text>
          <Text variant="paragraph4" as="p" sx={{ my: 3 }}>
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
              icon={customOpened ? chevron_up : chevron_down}
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
  const { web3Context$ } = useMainContext()
  const { accountData$ } = useAccountContext()
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

  const { account } = web3Context

  return (
    <Grid>
      <Flex sx={{ alignItems: 'center' }}>
        <BlockNativeAvatar sx={{ mr: 2 }} />
        <Grid sx={{ gap: 0, width: '100%' }}>
          <Flex sx={{ justifyContent: 'space-between' }}>
            <Text variant="boldParagraph3" sx={{ letterSpacing: '0.02em' }}>
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

          {accountData && accountData.daiBalance && (
            <Flex sx={{ alignItems: 'center' }}>
              <Icon sx={{ zIndex: 1 }} icon={dai_color} size={16} />
              <Text
                variant="paragraph4"
                sx={{
                  ml: 1,
                  color: 'neutral80',
                  textTransform: 'uppercase',
                }}
              >
                {formatCryptoBalance(accountData.daiBalance)}
              </Text>
            </Flex>
          )}
        </Grid>
      </Flex>
    </Grid>
  )
}

export function UserSettings({ sx }: { sx?: ThemeUIStyleObject }) {
  const { t } = useTranslation()
  const { disconnect } = useWalletManagement()
  const [holdingShift, setHoldingShift] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setHoldingShift(true)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setHoldingShift(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const disconnectCallback = useCallback(
    async (clearStorage: boolean) => {
      disconnect()
      clearStorage && localStorage.clear()
    },
    [disconnect],
  )

  return (
    <Box sx={sx}>
      <Heading as="p" variant="boldParagraph1" sx={{ mb: 3 }}>
        {t('wallet')}
      </Heading>
      <WalletInfo />
      <Heading as="p" variant="boldParagraph1" sx={{ mt: 4, mb: 3 }}>
        {t('user-settings.slippage-limit.preset-title')}
      </Heading>
      <SlippageSettingsForm />
      <Box
        sx={{
          mt: '16px',
          mb: '24px',
          borderTop: '1px solid',
          borderColor: 'neutral20',
          height: '1px',
          width: '100%',
        }}
      />
      <Button
        variant="textual"
        sx={{
          p: 0,
          my: 16,
          display: 'flex',
          alignItems: 'center',
        }}
        onClick={async () => {
          await disconnectCallback(holdingShift)
        }}
      >
        <Icon
          icon={sign_out}
          color={holdingShift ? 'warning100' : 'primary60'}
          size="auto"
          width={20}
        />
        <Text
          variant="paragraph3"
          sx={{ fontWeight: 'medium', color: holdingShift ? 'warning100' : 'primary60', ml: 2 }}
        >
          {holdingShift ? t('disconnect-wallet-and-clear-data') : t('disconnect-wallet')}
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
        <AppLink
          variant="settings"
          withAccountPrefix={false}
          href={EXTERNAL_LINKS.KB.HELP}
          onClick={close}
        >
          {t('account-support')}
        </AppLink>
      </Flex>
    </Box>
  )
}

export interface UserSettingsButtonContentsProps {
  context: ContextConnected
  accountData: AccountDetails
  active?: boolean | undefined
}

export function UserSettingsButtonContents({
  context,
  accountData,
  active,
}: UserSettingsButtonContentsProps) {
  return (
    <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Flex sx={{ alignItems: 'center' }}>
        <BlockNativeAvatar />
        <Text
          as="p"
          variant="paragraph3"
          sx={{ ml: 3, color: 'primary100', fontWeight: 500, letterSpacing: '0.02em' }}
        >
          {accountData.ensName || formatAddress(context.account, 6)}
        </Text>
      </Flex>
      <Flex sx={{ ml: 2, transition: 'color 200ms' }}>
        <Icon
          size="auto"
          width="16"
          height="16"
          icon={settings}
          sx={{ flexShrink: 0, m: '13px' }}
          color={active ? 'primary100' : 'inherit'}
        />
      </Flex>
    </Flex>
  )
}

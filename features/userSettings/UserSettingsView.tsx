import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { getConnectionKindMessage } from 'components/connectWallet/ConnectWallet'
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

function SlippageSettingsForm(props: UserSettingsState) {
  const { slippageInput, setSlippageInput, errors, warnings, slippage } = props
  const { t } = useTranslation()
  const [customOpened, setCustomOpened] = useState(false)

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

  return (
    <Grid>
      <Flex sx={{ justifyContent: 'space-between' }}>
        {connectionKind === 'network' ? (
          <Text sx={{ fontWeight: 'semiBold' }}>{t('connected-in-readonly-mode')}</Text>
        ) : (
          <Text sx={{ fontWeight: 'semiBold' }}>
            {t('connected-with', {
              connectionKind: getConnectionKindMessage(connectionKind),
            })}
          </Text>
        )}
      </Flex>
      <Flex sx={{ alignItems: 'center' }}>
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

export function UserSettingsDropdown(
  props: UserSettingsState & { opened: boolean; setOpened: (opened: boolean) => void },
) {
  const {
    slippage,
    slippageInput,
    stage,
    saveSettings,
    canProgress,
    reset,
    opened,
    setOpened,
  } = props
  const { t } = useTranslation()

  useEffect(() => {
    if (!opened) {
      reset()
    }
  }, [opened])

  const wrapperRef = useOutsideElementClickHandler(() => setOpened(false))

  const onClose = () => setOpened(false)

  return (
    <MobileSidePanelPortal>
      <Card
        sx={{
          display: ['block', opened ? 'block' : 'none'],
          p: [4, 4],
          pt: [0, 4],
          position: ['fixed', 'absolute'],
          top: [0, 'auto'],
          left: [0, 'auto'],
          right: 0,
          bottom: 0,
          minWidth: ['100%', '380px'],
          transition: ['0.3s transform ease-in-out', '0s'],
          transform: [`translateX(${opened ? '0' : '100'}%)`, 'translateY(calc(100% + 10px))'],
          bg: ['background'],
          boxShadow: ['none', 'userSettingsCardDropdown'],
          borderRadius: ['0px', 'mediumLarge'],
          border: 'none',
          overflowX: ['hidden', 'visible'],
          zIndex: ['modal', 0],
        }}
        ref={wrapperRef}
      >
        <MobileSidePanelClose opened={opened} onClose={onClose} />
        <WalletInfo />
        <SlippageSettingsForm {...props} />
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
      </Card>
    </MobileSidePanelPortal>
  )
}

export function UserSettingsButton() {
  const { accountData$, userSettings$, context$ } = useAppContext()
  const [userSettings] = useObservable(userSettings$)
  const [opened, setOpened] = useState(false)
  const [context] = useObservable(context$)
  const [accountData] = useObservable(accountData$)

  const { t } = useTranslation()

  if (!userSettings || !context || context.status === 'connectedReadonly' || !accountData)
    return null

  return (
    <Flex sx={{ position: 'relative', mr: 2 }}>
      <Button
        variant="menuButton"
        onClick={() => setOpened(!opened)}
        sx={{ mr: 1, px: [2, 3], width: ['40px', 'auto'] }}
      >
        <Flex sx={{ alignItems: 'center', justifyContent: 'center', px: [0, 1] }}>
          <Text sx={{ display: ['none', 'none', 'block'] }}>
            <AccountIndicator address={context.account} ensName={accountData.ensName} />
          </Text>
          <Icon
            size="auto"
            width="12"
            height="7"
            name={opened ? 'chevron_up' : 'chevron_down'}
            sx={{ display: ['none', 'none', 'block'], ml: '6px', position: 'relative', top: '1px' }}
          />
          <Icon
            size="auto"
            width="16"
            height="16"
            name="settings"
            sx={{ display: ['block', 'block', 'none'], flexShrink: 0 }}
          />
        </Flex>
      </Button>
      <UserSettingsDropdown {...userSettings} opened={opened} setOpened={setOpened} />
    </Flex>
  )
}

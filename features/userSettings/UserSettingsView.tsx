import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { AppSpinner } from 'helpers/AppSpinner'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatPercent, formatPrecision } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { ChangeEvent, useState } from 'react'
import { useEffect } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Box, Button, Card, Flex, Grid, SxStyleProp, Text } from 'theme-ui'
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
        <Text sx={{ ...validationMessageStyles, color: 'onWarning' }}>
          {t(getSlippageLimitMessageTranslation(message))}
        </Text>
      ))}
      {errors.map((message) => (
        <Text sx={{ ...validationMessageStyles, color: 'onError' }}>
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
        <AppLink
          href="https://kb.oasis.app/help/slippage"
          sx={{ fontSize: 2, fontWeight: 'body', mt: -1 }}
        >
          {t('user-settings.slippage-limit.read-more')}
        </AppLink>
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

export function UserSettingsDropdown(props: UserSettingsState) {
  const { slippage, slippageInput, stage, saveSettings, canProgress, reset } = props
  const { t } = useTranslation()

  useEffect(() => {
    return () => {
      reset()
    }
  }, [])

  return (
    <Card
      sx={{
        p: 4,
        position: 'absolute',
        minWidth: '380px',
        bottom: '0',
        right: '0',
        transform: 'translateY(calc(100% + 10px))',
        boxShadow: 'userSettingsCardDropdown',
        borderRadius: 'mediumLarge',
        border: 'none',
      }}
    >
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
  )
}

export function UserSettingsButton() {
  const { userSettings$ } = useAppContext()
  const userSettings = useObservable(userSettings$)
  const [opened, setOpened] = useState(false)
  const { t } = useTranslation()

  if (!userSettings) return null

  return (
    <Flex sx={{ position: 'relative', mr: 2 }}>
      <Button variant="menuButton" onClick={() => setOpened(!opened)} sx={{ mr: 1, px: 3 }}>
        <Flex sx={{ alignItems: 'center', px: 1 }}>
          <Text>{t('user-settings.button-menu')}</Text>
          <Icon
            size="auto"
            width="12"
            height="7"
            name={opened ? 'chevron_up' : 'chevron_down'}
            sx={{ ml: '6px', position: 'relative', top: '1px' }}
          />
        </Flex>
      </Button>
      {opened && <UserSettingsDropdown {...userSettings} />}
    </Flex>
  )
}

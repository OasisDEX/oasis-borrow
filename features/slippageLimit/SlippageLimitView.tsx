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
import { Box, Button, Card, Divider, Flex, Grid, SxStyleProp, Text } from 'theme-ui'
import { UnreachableCaseError } from 'ts-essentials'

import {
  SLIPPAGE_OPTIONS,
  SlippageLimitErrorMessages,
  SlippageLimitState,
  SlippageLimitWarningMessages,
} from './slippageLimit'

function SlippageOptionButton({ option, onClick }: { option: BigNumber; onClick: () => void }) {
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
          boxShadow: 'slippageOptionButton',
        },
      }}
      onClick={onClick}
    >
      {formatPercent(option, { precision: 2 })}
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
  message: SlippageLimitErrorMessages | SlippageLimitWarningMessages,
) {
  switch (message) {
    case 'invalidSlippage':
      return 'slippage-limit.errors.invalid-slippage'
    case 'highSlippage':
      return 'slippage-limit.warnings.high-slippage'
    default:
      throw new UnreachableCaseError(message)
  }
}

function SlippageLimitMessages({
  errors,
  warnings,
}: Pick<SlippageLimitState, 'errors' | 'warnings'>) {
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

export function SlippageLimitDropdown(props: SlippageLimitState) {
  const {
    slippageInput,
    setSlippageLow,
    setSlippageMedium,
    setSlippageHigh,
    setSlippageCustom,
    saveSlippage,
    stage,
    canProgress,
    reset,
    errors,
    warnings,
  } = props
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
        boxShadow: 'slippageCardDropdown',
        borderRadius: 'mediumLarge',
        border: 'none',
      }}
    >
      <Box>
        <Text variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
          {t('slippage-limit.preset-title')}
        </Text>
        <Text variant="paragraph3" sx={{ color: 'text.subtitle' }}>
          {t('slippage-limit.preset-description')}
        </Text>
        <AppLink href="https://kb.oasis.app/help/slippage" sx={{ fontSize: 2, fontWeight: 'body' }}>
          {t('slippage-limit.read-more')}
        </AppLink>
        <Flex sx={{ mt: 3 }}>
          <SlippageOptionButton option={SLIPPAGE_OPTIONS[0]} onClick={setSlippageLow} />
          <SlippageOptionButton option={SLIPPAGE_OPTIONS[1]} onClick={setSlippageMedium} />
          <SlippageOptionButton option={SLIPPAGE_OPTIONS[2]} onClick={setSlippageHigh} />
        </Flex>
      </Box>
      <Divider sx={{ mt: 4, mb: 2 }} />
      <Box mb={3}>
        <Text variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
          {t('slippage-limit.custom-title')}
        </Text>
        <Text variant="paragraph3" sx={{ color: 'text.subtitle' }}>
          {t('slippage-limit.custom-description')}
        </Text>
        <Card sx={{ mt: 3, borderRadius: 'mediumLarge' }}>
          <Grid px={2} gap={2}>
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
              {t('slippage-limit.custom-label')}
            </Text>
            <BigNumberInput
              type="text"
              mask={createNumberMask({
                allowDecimal: true,
                prefix: '',
              })}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSlippageCustom(new BigNumber(e.target.value.replace(/,/g, '')))
              }
              value={slippageInput ? formatPrecision(slippageInput, 2) : undefined}
              sx={{ variant: 'forms.inputSecondary' }}
            />
          </Grid>
        </Card>
      </Box>
      <SlippageLimitMessages {...{ errors, warnings }} />
      <Button
        disabled={!canProgress || stage === 'inProgress'}
        onClick={saveSlippage}
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
              ? t('slippage-limit.button-in-progress')
              : t('slippage-limit.button')}
          </Text>
        </Flex>
      </Button>
      {stage === 'success' && (
        <Text sx={{ ...saveStatusMessageStyles, color: 'onSuccess' }}>
          {t('slippage-limit.update-success')}
        </Text>
      )}
      {stage === 'failure' && (
        <Text sx={{ ...saveStatusMessageStyles, color: 'onError' }}>
          {t('slippage-limit.update-failure')}
        </Text>
      )}
    </Card>
  )
}

export function SlippageLimitButton() {
  const { slippageLimit$ } = useAppContext()
  const slippageLimit = useObservable(slippageLimit$)
  const [opened, setOpened] = useState(false)

  if (!slippageLimit) return null

  return (
    <Flex sx={{ position: 'relative', mr: 2 }}>
      <Button variant="menuButton" onClick={() => setOpened(!opened)} sx={{ mr: 1, px: 2 }}>
        <Flex sx={{ alignItems: 'center', px: 1 }}>
          <Icon size="auto" width="15" height="26" name="slippage_limit" sx={{ mr: '6px' }} />
          <Text>{formatPercent(slippageLimit.slippage, { precision: 2 })}</Text>
        </Flex>
      </Button>
      {slippageLimit && opened && <SlippageLimitDropdown {...slippageLimit} />}
    </Flex>
  )
}

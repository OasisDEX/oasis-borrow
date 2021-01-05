/*
 * Copyright (C) 2020 Maker Ecosystem Growth Holdings, INC.
 */
// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { Box, Card, Flex, Grid, Input, Label, Text } from '@theme-ui/components'
import { BigNumber } from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { getToken } from 'components/blockchain/config'
import { ModalBottom, ModalButton } from 'components/Modal'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance, formatFiatBalance } from 'helpers/formatters/format'
import arFlagSvg from 'helpers/icons/ar-flag.svg'
import brFlagSvg from 'helpers/icons/br-flag.svg'
import mxFlagSvg from 'helpers/icons/mx-flag.svg'
import { ModalProps } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'i18n'
import React, { ChangeEvent, useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons'
import { Heading, Image } from 'theme-ui'

import { trackingEvents } from '../../analytics/analytics'
import {
  AmountFieldChange,
  CurrencyFieldChange,
  EmailFieldChange,
  FormChangeKind,
  getBuyAmount,
  Message,
  MessageKind,
  OnrampKind,
  OnrampKindChange,
  QuoteCurrencyFieldChange,
} from './onrampForm'

function messageContent(msg: Message, token: string, t: Function) {
  switch (msg.kind) {
    case MessageKind.incorrectAmount:
      return t('min-amount', { token, minAmount: msg.minAmount.toFixed(4, 0) })

    case MessageKind.missingEmail:
      return t(`email-required`)
    default:
      return null
  }
}

type CurrencyOption = {
  value: string
  label: JSX.Element
}

type OnRampFormProps = {
  onramp: OnrampKind
}

const options = [
  {
    value: 'DAI',
    label: (
      <Flex sx={{ alignItems: 'center' }}>
        <Icon name="dai_circle_color" size={30} mr={2} />
        <Text ml={1}>DAI</Text>
      </Flex>
    ),
  },
  {
    value: 'ETH',
    label: (
      // minHeight to compensate for screen jumping while switching currencies
      <Flex sx={{ alignItems: 'center', minHeight: '30px' }}>
        <Icon name="ether_circle_color" size={27} mr={2} />
        <Text ml={1}>ETH</Text>
      </Flex>
    ),
  },
]

type CurrencySelectProps = {
  token: string
  handleCurrencyChange: (value: string) => void
}

function CurrencySelect({ token, handleCurrencyChange }: CurrencySelectProps) {
  return (
    <ReactSelect
      options={options.filter(({ value }) => value !== token)}
      components={{
        IndicatorsContainer: () => null,
        ValueContainer: ({ children }) => (
          <Flex my={1} sx={{ color: 'primary' }}>
            {children}
          </Flex>
        ),
        SingleValue: ({ children }) => <Box>{children}</Box>,
        Option: ({ children, innerProps }) => (
          <Box
            {...innerProps}
            sx={{
              p: 3,
              cursor: 'pointer',
              '&:hover': {
                bg: 'background',
              },
            }}
          >
            {children}
          </Box>
        ),
        Menu: ({ innerProps, children }) => (
          <Card
            {...innerProps}
            sx={{
              position: 'absolute',
              width: '100%',
              mt: 2,
              borderRadius: 'large',
              fontSize: 5,
              p: 0,
              overflow: 'hidden',
            }}
          >
            {children}
          </Card>
        ),
        MenuList: ({ children }) => <Box>{children}</Box>,
        Control: ({ innerProps, children, selectProps: { menuIsOpen } }) => (
          <Flex
            {...innerProps}
            sx={{
              variant: 'forms.select',
              cursor: 'pointer',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
            }}
          >
            {children}
            <Icon name={menuIsOpen ? 'chevron_up' : 'chevron_down'} />
          </Flex>
        ),
      }}
      isSearchable={false}
      defaultValue={options.find(({ value }) => value === token)}
      // @ts-ignore
      onChange={({ value }) => handleCurrencyChange(value)}
    />
  )
}

type CountrySelectProps = {
  handleCountryChange: (value: string) => void
  latamexCurrencyOptions: CurrencyOption[]
  defaultOption: CurrencyOption
}

function CountrySelect({
  handleCountryChange,
  latamexCurrencyOptions,
  defaultOption,
}: CountrySelectProps) {
  return (
    <ReactSelect
      options={latamexCurrencyOptions}
      components={{
        IndicatorsContainer: () => null,
        ValueContainer: ({ children }) => (
          <Flex my={1} sx={{ color: 'primary' }}>
            {children}
          </Flex>
        ),
        SingleValue: ({ children }) => <Box>{children}</Box>,
        Option: ({ children, innerProps }) => (
          <Box
            {...innerProps}
            sx={{
              p: 3,
              cursor: 'pointer',
              '&:hover': {
                bg: 'background',
              },
            }}
          >
            {children}
          </Box>
        ),
        Menu: ({ innerProps, children }) => (
          <Card
            {...innerProps}
            sx={{
              position: 'absolute',
              width: '100%',
              mt: 2,
              borderRadius: 'large',
              fontSize: 5,
              p: 0,
              overflow: 'hidden',
            }}
          >
            {children}
          </Card>
        ),
        MenuList: ({ children }) => <Box>{children}</Box>,
        Control: ({ innerProps, children, selectProps: { menuIsOpen } }) => (
          <Flex
            {...innerProps}
            sx={{
              variant: 'forms.select',
              cursor: 'pointer',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
            }}
          >
            {children}
            <Icon name={menuIsOpen ? 'chevron_up' : 'chevron_down'} />
          </Flex>
        ),
      }}
      isSearchable={false}
      defaultValue={defaultOption}
      // @ts-ignore
      onChange={({ value }) => handleCountryChange(value)}
    />
  )
}

interface QueryDefaults {
  hasQueryDefaults: boolean
  defaultAmount?: BigNumber
  defaultQuoteCurrency?: 'ARS' | 'BRL' | 'MXN'
  defaultEmail?: string
}

export function OnrampFormView({
  onramp,
  close,
  hasQueryDefaults,
  defaultQuoteCurrency,
  defaultAmount,
  defaultEmail,
}: ModalProps<OnRampFormProps & QueryDefaults>) {
  const { onrampForm$ } = useAppContext()
  const onrampForm = useObservable(onrampForm$)
  const { t } = useTranslation('common')

  const latamexCurrencyOptions = [
    {
      value: 'ARS',
      label: (
        <Flex sx={{ alignItems: 'center' }}>
          <Image src={arFlagSvg} mr={2} sx={{ width: '27px' }} />
          <Text ml={1}>{t('Argentina')}</Text>
        </Flex>
      ),
    },
    {
      value: 'BRL',
      label: (
        <Flex sx={{ alignItems: 'center' }}>
          <Image src={brFlagSvg} mr={2} sx={{ width: '27px' }} />
          <Text ml={1}>{t('Brasil')}</Text>
        </Flex>
      ),
    },
    {
      value: 'MXN',
      label: (
        <Flex sx={{ alignItems: 'center' }}>
          <Image src={mxFlagSvg} mr={2} sx={{ width: '27px' }} />
          <Text ml={1}>{t('Mexico')}</Text>
        </Flex>
      ),
    },
  ]

  useEffect(() => {
    if (onrampForm && onramp !== onrampForm.onramp && !hasQueryDefaults) {
      onrampForm.change({
        onramp,
        kind: FormChangeKind.onrampKindChange,
      } as OnrampKindChange)
    }
  }, [onrampForm])

  const [hasInitialisedDefaults, setHasInitialisedDefaults] = useState<boolean>(false)
  useEffect(() => {
    if (!hasInitialisedDefaults && onrampForm && hasQueryDefaults) {
      onrampForm.change({
        onramp,
        kind: FormChangeKind.onrampKindChange,
      } as OnrampKindChange)

      onrampForm.change({
        kind: FormChangeKind.quoteCurrencyFieldChange,
        value: defaultQuoteCurrency,
      } as QuoteCurrencyFieldChange)

      onrampForm.change({
        kind: FormChangeKind.amountFieldChange,
        value: defaultAmount,
      } as AmountFieldChange)

      if (defaultEmail && defaultEmail !== '') {
        onrampForm.change({
          kind: FormChangeKind.emailFieldChange,
          value: defaultEmail,
        } as EmailFieldChange)
      }
      setHasInitialisedDefaults(true)
    }
  }, [onrampForm])

  if (!onrampForm) {
    return null
  }

  const { amount, messages, proceed, token, quoteCurrency, email } = onrampForm

  const errorMessages = (messages || []).map((msg) => messageContent(msg, token, t))

  function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/,/g, '')
    onrampForm!.change({
      kind: FormChangeKind.amountFieldChange,
      value: value === '' ? null : new BigNumber(value),
    } as AmountFieldChange)
  }

  function handleCurrencyChange(value: string) {
    onrampForm!.change({
      kind: FormChangeKind.currencyFieldChange,
      value,
    } as CurrencyFieldChange)
  }

  function handleCountryChange(value: string) {
    onrampForm!.change({
      kind: FormChangeKind.quoteCurrencyFieldChange,
      value,
    } as QuoteCurrencyFieldChange)
  }

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    onrampForm!.change({
      kind: FormChangeKind.emailFieldChange,
      value: e.target.value,
    } as EmailFieldChange)
  }

  const buyAmount = getBuyAmount(onrampForm, amount || new BigNumber(1))
  const hasErrors = errorMessages.length > 0
  const canProceed =
    amount && (onramp === OnrampKind.Latamex ? email && email.length > 0 : true) && !hasErrors

  function getDefaultCurrencyOption() {
    if (hasQueryDefaults) {
      const option = latamexCurrencyOptions.find((opt) => opt.value === defaultQuoteCurrency)
      if (option) {
        return option
      }
    }
    return latamexCurrencyOptions[0]
  }

  return (
    <ModalBottom {...{ close }}>
      <Grid gap={4}>
        <Heading sx={{ textAlign: 'center' }}>
          {t('buy')} {token}
        </Heading>
        <Grid>
          <Box>
            <Label sx={{ mb: 2 }}>{t('currency')}</Label>
            <CurrencySelect {...{ token, handleCurrencyChange }} />
            <Label sx={{ mt: 3, mb: 2 }}>{t('amount')}</Label>
            <BigNumberInput
              data-test-id="type-amount"
              type="text"
              mask={createNumberMask({
                allowDecimal: true,
                decimalLimit: getToken(token).digits,
                prefix: '',
              })}
              onChange={handleAmountChange}
              value={(amount || null) && formatAmount(amount as BigNumber, token)}
              guide={true}
              placeholder={'0'}
              variant={hasErrors ? 'inputError' : 'input'}
            />
            {hasErrors && (
              <Text variant="error" sx={{ fontSize: 3, mt: 2, pt: 1 }}>
                {errorMessages.map((msg) => msg)}
              </Text>
            )}

            {onrampForm.onramp === OnrampKind.Latamex && (
              <>
                <Label sx={{ mt: 3, mb: 2 }}>{t('country')}</Label>
                <CountrySelect
                  {...{
                    latamexCurrencyOptions,
                    handleCountryChange,
                    defaultOption: getDefaultCurrencyOption(),
                  }}
                />
                <Label sx={{ mt: 3, mb: 2 }}>{t('email')}</Label>
                <Input value={email} onChange={handleEmailChange} />
              </>
            )}
          </Box>
          <Card variant="secondaryRounded" sx={{ p: 3 }}>
            <Grid p={2} sx={{ fontSize: 4 }}>
              {buyAmount && (
                <Box>
                  <Label>{t('exchange-rate')}</Label>
                  <Text sx={{ color: 'onSurface' }}>
                    {formatFiatBalance(buyAmount)} {quoteCurrency} into{' '}
                    {formatCryptoBalance(amount || new BigNumber(1))} {token}
                  </Text>
                </Box>
              )}
            </Grid>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 3 }}>
        <Text sx={{ color: 'onSurface', px: 1 }}>{t('onramp-leave-message')}</Text>
        <ModalButton
          onClick={
            canProceed
              ? () => {
                  proceed(onrampForm)
                  trackingEvents.onrampProceed(onrampForm.token)
                }
              : undefined
          }
          disabled={!canProceed}
          sx={{ mt: 3 }}
        >
          {t('buy-with', { token, onramp })}
        </ModalButton>
      </Box>
    </ModalBottom>
  )
}

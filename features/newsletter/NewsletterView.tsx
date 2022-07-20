import { Icon } from '@makerdao/dai-ui-icons'
import { trackingEvents } from 'analytics/analytics'
import { isAppContextAvailable } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { AppSpinner } from 'helpers/AppSpinner'
import { Trans, useTranslation } from 'next-i18next'
import React, { FormEvent, useState } from 'react'
import { useEffect } from 'react'
import { GRADIENTS } from 'theme'
import { Box, Button, Flex, Grid, Heading, Input, Text } from 'theme-ui'

import { createNewsletter$, NewsletterMessage, NewsletterState } from './newsletter'
import { NewsletterResponseMessage } from './newsletterApi'

export const NEWSLETTER_FORM_ERROR: {
  [key in NewsletterMessage | NewsletterResponseMessage]: string
} = {
  unknown: 'unknown',
  emailIsInvalid: 'email-is-invalid',
  emailAlreadyExists: 'email-already-exists',
  emailPending: 'email-pending',
}

function NewsletterFormSuccess({ small }: { small?: boolean }) {
  const { t } = useTranslation()

  return (
    <Box sx={{ textAlign: small ? 'left' : 'center' }}>
      <Box
        sx={{
          display: 'inline-flex',
          bg: 'secondary60',
          borderRadius: '3em',
          px: 4,
          py: 3,
          alignItems: 'center',
        }}
      >
        <Flex
          sx={{
            mx: 'auto',
            width: small ? '32px' : '40px',
            height: small ? '32px' : '40px',
            alignItems: 'center',
            justifyContent: 'center',
            background: GRADIENTS.newsletterSuccess,
            borderRadius: '50%',
          }}
        >
          <Icon name="checkmark" color="neutral10" size={small ? 16 : 21} />
        </Flex>
        <Box sx={{ flex: 1, ml: 3, textAlign: 'center' }}>
          <Text
            sx={{
              color: 'neutral80',
              fontSize: small ? 1 : 3,
              py: 1,
              maxWidth: '32em',
              textAlign: 'left',
              fontWeight: 'semiBold',
            }}
          >
            {t('newsletter.success')}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

function NewsletterForm({ small }: { small?: boolean }) {
  const [inputOnFocus, setInputOnFocus] = useState(false)
  const [gdprBoxOnHover, setGdprBoxOnHover] = useState(false)
  const [newsletterForm, setNewsletterForm] = useState<NewsletterState | undefined>(undefined)
  const { t } = useTranslation()

  useEffect(() => {
    const subscription = createNewsletter$().subscribe((v) => setNewsletterForm(v))

    return () => subscription.unsubscribe()
  }, [])

  if (!newsletterForm) return null
  const { change, email, submit, messages, messageResponse, stage } = newsletterForm

  function onSubmit(e: FormEvent<HTMLDivElement>) {
    e.preventDefault()

    if (submit) {
      submit()
      trackingEvents.newsletterSubscribe(small ? 'Footer' : 'Homepage')
    }
  }

  const showError = (messages.length > 0 && email !== '' && !inputOnFocus) || messageResponse

  const errorKey = NEWSLETTER_FORM_ERROR[messages[0] || messageResponse]

  return stage === 'success' ? (
    <NewsletterFormSuccess small={small} />
  ) : (
    <Box
      as="form"
      onSubmit={onSubmit}
      sx={{
        width: '100%',
        mx: 'auto',
      }}
    >
      <Flex
        sx={{
          borderRadius: '2em',
          bg: ['transparent', 'neutral10'],
          border: 'light',
          borderColor: 'secondary100',
          height: small ? '38px' : 'initial',
          justifyContent: 'space-between',
          px: 2,
        }}
      >
        <Input
          placeholder={t('newsletter.placeholder')}
          sx={{
            bg: 'neutral10',
            borderRadius: 'inherit',
            border: 'none',
            px: 3,
            width: '70%',
            fontSize: small ? 2 : 3,
            lineHeight: 1.2,
          }}
          value={email}
          onChange={(e) => {
            change({ kind: 'email', email: e.target.value })
          }}
          onFocus={() => setInputOnFocus(true)}
          onBlur={() => setInputOnFocus(false)}
        />
        <Button
          variant="textual"
          sx={{
            fontWeight: 'semiBold',
            borderRadius: 'inherit',
            fontSize: 2,
            letterSpacing: '0.02em',
            lineHeight: 'inputLarge',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'primary100',
            '&:disabled': {
              opacity: 0.7,
            },
            '&:hover:not([disabled])': { opacity: 1 },
            '&:hover svg': {
              transform: 'translateX(4px)',
            },
          }}
          type="submit"
          disabled={!submit}
        >
          {stage === 'inProgress' ? (
            <AppSpinner sx={{ color: 'primary100' }} variant="styles.spinner.large" />
          ) : (
            <Flex sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
              <Text mr={1}>{t('newsletter.button')}</Text>
              <Icon
                name="arrow_right"
                size="auto"
                height="14px"
                sx={{ ml: 1, position: 'relative', transition: 'ease-in-out 0.2s', left: 0 }}
              />
            </Flex>
          )}
        </Button>
      </Flex>
      <Box sx={{ minHeight: small ? '137px' : '128px', mt: small ? 1 : 2 }}>
        <Box sx={{ mt: small ? 1 : 2 }}>
          {showError && (
            <Text sx={{ textAlign: 'left', color: 'critical100', fontSize: 2, ml: 3 }}>
              {errorKey ? t(`newsletter.errors.${errorKey}`) : messageResponse}
            </Text>
          )}
        </Box>
        <Box
          sx={{ mt: small ? 1 : 2 }}
          onMouseEnter={() => setGdprBoxOnHover(true)}
          onMouseLeave={() => setGdprBoxOnHover(false)}
        >
          {(inputOnFocus || showError || gdprBoxOnHover) && (
            <Box sx={{ p: 3, borderRadius: '16px' }} bg="secondary60">
              <Text sx={{ textAlign: 'left', color: 'neutral80', fontSize: 2 }}>
                <Trans
                  i18nKey="newsletter.gdpr"
                  components={{
                    1: <AppLink href="/privacy" variant="inText" />,
                  }}
                ></Trans>
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export function NewsletterSection({ small }: { small?: boolean }) {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        ...(small && {
          '@media screen and (max-width: 1124px)': {
            maxWidth: '100%',
            ml: '0',
          },
        }),
        width: '100%',
        maxWidth: ['100%', '604px'],
      }}
    >
      <Grid sx={{ textAlign: small ? 'left' : 'center' }} gap={1} mb={small ? 3 : 4}>
        <Heading variant="header2" sx={{ fontWeight: 'body', fontSize: small ? 4 : 7 }}>
          {t('newsletter.title')}
        </Heading>
        {small && <Text sx={{ color: 'neutral80' }}>{t('newsletter.subtitle')}</Text>}
      </Grid>
      {isAppContextAvailable() ? <NewsletterForm small={small} /> : null}
    </Box>
  )
}

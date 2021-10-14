import { Icon } from '@makerdao/dai-ui-icons'
import { trackingEvents } from 'analytics/analytics'
import { isAppContextAvailable } from 'components/AppContextProvider'
import { AppSpinner } from 'helpers/AppSpinner'
import { useTranslation } from 'next-i18next'
import React, { FormEvent, useState } from 'react'
import { useEffect } from 'react'
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
  return (
    <Grid sx={{ bg: 'bgPrimaryAlt', borderRadius: '2em', p: small ? 3 : 4 }}>
      <Flex
        sx={{
          mx: 'auto',
          width: small ? '48px' : '64px',
          height: small ? '48px' : '64px',
          alignItems: 'center',
          justifyContent: 'center',
          bg: 'primary',
          borderRadius: '50%',
        }}
      >
        <Icon name="checkmark" color="surface" size={21} />
      </Flex>
      <Box sx={{ flex: 1, ml: 3, textAlign: 'center' }}>
        <Heading sx={{ fontSize: small ? 5 : 6 }}>Success!</Heading>
        <Text sx={{ fontSize: small ? 1 : 2, mt: 2 }}>
          If you do not receive the confirmation email within a few minutes of signing up, please
          check your Spam folder. Choose the confirmation message and mark as not spam. This will
          move the message to your inbox and enable the link for you to subscribe.
        </Text>
      </Box>
    </Grid>
  )
}

function NewsletterFormInternal({ small }: { small?: boolean }) {
  const [inputOnFocus, setInputOnFocus] = useState(false)
  const [newsletterForm, setNewsletterForm] = useState<NewsletterState | undefined>(undefined)
  const { t } = useTranslation()

  useEffect(() => {
    const subscription = createNewsletter$().subscribe((v) => setNewsletterForm(v))

    return () => subscription.unsubscribe()
  }, [])

  if (!newsletterForm) return null
  const { change, email, submit, stage, messages, messageResponse } = newsletterForm

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
        maxWidth: '610px',
        width: '100%',
        mx: 'auto',
      }}
    >
      <Flex
        sx={{
          borderRadius: '2em',
          bg: ['transparent', 'bgPrimaryAlt'],
          border: 'light',
          borderColor: 'newsletterInputBorder',
          flexDirection: ['column', 'row'],
          height: ['initial', small ? '33px' : 'initial'],
          px: 2,
        }}
      >
        <Input
          placeholder={t('newsletter.placeholder')}
          sx={{
            bg: 'bgPrimaryAlt',
            borderRadius: 'inherit',
            border: 'none',
            px: 3,
            flex: 1,
            mb: [3, 0],
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
            width: ['100%', 'auto'],
            fontWeight: 'semiBold',
            borderRadius: 'inherit',
            fontSize: 2,
            letterSpacing: '0.02em',
            lineHeight: 'inputLarge',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'primary',
            '&:disabled': {
              opacity: 0.7,
              cursor: 'not-allowed',
            },
          }}
          type="submit"
          disabled={!submit}
        >
          {stage === 'inProgress' ? (
            <AppSpinner sx={{ color: 'surface' }} variant={small ? 'default' : 'defaultBulletin'} />
          ) : (
            <Flex sx={{ alignItems: 'center' }}>
              <Text mr={1}>{t('newsletter.button')}</Text>
              <Icon size="auto" height="14px" name="arrow_right" />
            </Flex>
          )}
        </Button>
      </Flex>
      <Box sx={{ mt: 2, minHeight: '1.3em' }}>
        {showError && (
          <Text sx={{ textAlign: 'left', color: 'onError', fontSize: 2 }}>
            {errorKey ? t(`newsletter.errors.${errorKey}`) : messageResponse}
          </Text>
        )}
      </Box>
    </Box>
  )
}

export function NewsletterForm({ small }: { small?: boolean }) {
  return isAppContextAvailable() ? <NewsletterFormInternal small={small} /> : null
}

export function NewsletterSection() {
  const { t } = useTranslation()

  return (
    <Box>
      <Grid sx={{ textAlign: 'center' }} gap={1} mb={4}>
        <Heading variant="header2" sx={{ fontWeight: 'bold' }}>
          {t('newsletter.title')}
        </Heading>
        <Text sx={{ color: 'text.subtitle' }}>{t('newsletter.subtitle')}</Text>
      </Grid>
      <NewsletterForm />
    </Box>
  )
}

export function NewsletterSectionFooter() {
  const { t } = useTranslation()

  return (
    <Box>
      <Grid sx={{ textAlign: 'center' }} gap={1} mb={4}>
        <Heading variant="header2" sx={{ fontWeight: 'bold' }}>
          {t('newsletter.title')}
        </Heading>
        <Text sx={{ color: 'text.subtitle' }}>{t('newsletter.subtitle')}</Text>
      </Grid>
      <NewsletterForm small />
    </Box>
  )
}

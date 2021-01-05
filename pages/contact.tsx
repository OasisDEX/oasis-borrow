import { isAppContextAvailable } from 'components/AppContextProvider'
import {
  ContactFormChange,
  ContactFormMessage,
  createContactForm,
  FormField,
} from 'components/contact/contact'
import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { AppSpinner } from 'helpers/loadingIndicator/LoadingIndicator'
import { useObservable } from 'helpers/observableHook'
import { WithChildren } from 'helpers/types'
import { useTranslation } from 'i18n'
import React, { FormEvent } from 'react'
import { Box, Button, Container, Grid, Heading, Input, Label, Text, Textarea } from 'theme-ui'

export function getMessageKey(msg: ContactFormMessage) {
  switch (msg.kind) {
    case 'emailIsInvalid':
      return 'email-invalid'
  }
}

function FormControlContainer({ children }: WithChildren) {
  return (
    <Grid gap={2} mb={3}>
      {children}
    </Grid>
  )
}

function FormInput({
  value,
  inputFieldKind,
  change,
  messages,
}: {
  value: string
  inputFieldKind: FormField
  change: (change: ContactFormChange) => void
  messages: ContactFormMessage[]
}) {
  const { t } = useTranslation()
  const errorMessages = messages.filter(({ field }) => field === inputFieldKind)
  const hasError = errorMessages.length > 0

  return (
    <FormControlContainer>
      <Label>{t(`contact.label.${inputFieldKind}`)}</Label>
      <Input
        value={value}
        onChange={(e) => change({ kind: inputFieldKind, value: e.target.value })}
        variant={hasError ? 'inputError' : 'inputContact'}
        sx={{
          '&:focus+div': {
            display: 'none',
          },
        }}
      />
      {hasError && (
        <Box>
          {errorMessages.map((msg) => (
            <Text variant="error" mt={1} key={msg.kind}>
              {t(getMessageKey(msg))}
            </Text>
          ))}
        </Box>
      )}
    </FormControlContainer>
  )
}

function ContactPageView() {
  const state = useObservable(createContactForm())
  const { t } = useTranslation()

  function onSubmit(e: FormEvent<HTMLDivElement>) {
    e.preventDefault()
    if (state?.submit) {
      state.submit()
    }
  }

  if (!state) return null
  const { change, name, email, subject, message, messages, submit, stage } = state

  return (
    <Container sx={{ maxWidth: '472px', p: 0 }}>
      <Heading variant="largeHeading" sx={{ textAlign: 'center', my: 3 }}>
        {t('contact.title')}
      </Heading>
      <Text sx={{ mb: 4, textAlign: 'center' }}>{t('contact.description')}</Text>
      <Box as="form" onSubmit={onSubmit}>
        <FormInput {...{ value: name, inputFieldKind: 'name', change, messages }} />
        <FormInput {...{ value: email, inputFieldKind: 'email', change, messages }} />
        <FormInput {...{ value: subject, inputFieldKind: 'subject', change, messages }} />
        <FormControlContainer>
          <Label>{t('contact.label.message')}</Label>
          <Textarea
            variant="textareaContact"
            value={message}
            onChange={(e) => change({ kind: 'message', value: e.target.value })}
            sx={{ resize: 'none', height: '280px' }}
            required
          />
        </FormControlContainer>
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Button
            type="submit"
            sx={{ borderRadius: 'medium', minWidth: '126px', lineHeight: 'body' }}
            disabled={!submit || stage === 'inProgress' || stage === 'success'}
          >
            {t('contact.submit')}
          </Button>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          {stage === 'inProgress' && <AppSpinner variant="styles.spinner.large" />}
          {stage === 'success' && t('contact.sent.success')}
          {stage === 'failure' && t('contact.sent.failure')}
        </Box>
      </Box>
    </Container>
  )
}

export default function ContactPage() {
  if (!isAppContextAvailable()) return null

  return <ContactPageView />
}

ContactPage.layout = MarketingLayout
ContactPage.theme = 'Landing'
ContactPage.seoTags = (
  <PageSEOTags title="seo.contact.title" description="seo.contact.description" />
)

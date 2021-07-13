import { Icon } from '@makerdao/dai-ui-icons'
import { useAppContext } from 'components/AppContextProvider'
import { MarketingLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { withRouter } from 'next/router'
import React from 'react'
import { Box, Button, Container, Grid, Heading } from 'theme-ui'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function ErrorPage() {
  const { t } = useTranslation()
  const { errorState$ } = useAppContext()
  const errorState = useObservable(errorState$)

  const [showResults, setShowResults] = React.useState(false)
  const onClick = () => setShowResults(true)

  return (
    <Container>
      <Grid gap={4} sx={{ justifyContent: 'center', textAlign: 'center', mt: 5, mx: 'auto' }}>
        <Heading>
          {t('error-message')}
          <AppLink sx={{ paddingLeft: 3 }} href="/">
            <Icon name="close" color="onError" size="auto" height="15px" />
          </AppLink>
        </Heading>
        <Button onClick={onClick} sx={{ maxWidth: 300, mx: 'auto' }}>
          {t('error-button')}
        </Button>
        <Box sx={{ justifyContent: 'center', textAlign: 'center', wordWrap: 'break-word' }}>
          {showResults ? errorState : null}
        </Box>
      </Grid>
    </Container>
  )
}

ErrorPage.layout = MarketingLayout
export default withRouter(ErrorPage)

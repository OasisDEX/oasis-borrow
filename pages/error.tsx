import { MarketingLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Button, Container, Grid, Heading, Flex } from 'theme-ui'
import { Icon } from '@makerdao/dai-ui-icons'

import { withRouter } from 'next/router'


export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

 function ErrorPage() {
  const { t } = useTranslation()
    // this.props.router.query.name
   
  return (
    <Container>
      <Grid gap={4} sx={{ justifyContent: 'center', textAlign: 'center', mt: 5 , mx: 'auto '}}>
        <Heading>{t('error-message')}
          <AppLink sx={{ paddingLeft: 3 }} href="/">
          <Icon name="close" color="onError" size="auto" height="15px"/>
          </AppLink>
        </Heading>
            <Button>{t('error-button')}</Button>
      </Grid>
    </Container>
  )
}

ErrorPage.layout = MarketingLayout
export default withRouter(ErrorPage)

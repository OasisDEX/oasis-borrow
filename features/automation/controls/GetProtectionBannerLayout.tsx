import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Grid, Heading, Image, Text } from 'theme-ui'

import { Banner } from '../../../components/Banner'
import { staticFilesRuntimeUrl } from '../../../helpers/staticPaths'

interface GetProtectionBannerLayoutProps {
  handleClick: () => void
  handleClose: () => void
}

export function GetProtectionBannerLayout({
  handleClick,
  handleClose,
}: GetProtectionBannerLayoutProps) {
  const { t } = useTranslation()

  return (
    <Banner
      close={() => {
        handleClose()
      }}
      sx={{ marginBottom: 3 }}
    >
      <Grid columns={2}>
        <Grid>
          <Heading variant="header2" as="h1">
            {t('protection.banner-header')}
          </Heading>
          <Text variant="subheader">{t('protection.banner-content')}</Text>
          <Button
            backgroundColor="selected"
            sx={{ borderRadius: '6px', '&:hover': { backgroundColor: 'selected' } }}
            onClick={handleClick}
          >
            <Text color="#575CFE">{t('protection.banner-button')}</Text>
          </Button>
        </Grid>
        <Image src={staticFilesRuntimeUrl('/static/img/automation.svg')} />
      </Grid>
    </Banner>
  )
}

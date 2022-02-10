import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Button, Grid, Heading, Image, Text } from 'theme-ui'

import { Banner } from '../../../components/Banner'
import { staticFilesRuntimeUrl } from '../../../helpers/staticPaths'

interface GetProtectionBannerLayoutProps {
  handleClick: () => void
}

export function GetProtectionBannerLayout({ handleClick }: GetProtectionBannerLayoutProps) {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(true)

  return isVisible ? (
    <Banner close={() => setIsVisible(false)} sx={{ marginBottom: 3 }}>
      <Grid columns={2}>
        <Grid>
          <Heading variant="header2" as="h1">
            {t('protection.banner-header')}
          </Heading>
          <Text variant="subheader">{t('protection.banner-content')}</Text>
          <Button backgroundColor="selected" sx={{ borderRadius: '6px' }} onClick={handleClick}>
            <Text color="#575CFE">{t('protection.banner-button')}</Text>
          </Button>
        </Grid>
        <Image src={staticFilesRuntimeUrl('/static/img/automation.svg')} />
      </Grid>
    </Banner>
  ) : null
}

import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Heading, Image, Text } from 'theme-ui'

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
      sx={{ marginBottom: 3, height: '160px' }}
    >
      <Flex sx={{ flexDirection: 'column' }}>
        <Heading variant="header2" as="h1" sx={{ mb: 2, zIndex: 1 }}>
          {t('protection.banner-header')}
        </Heading>
        <Text
          variant="subheader"
          sx={{ fontSize: 2, mb: '23px', fontWeight: 'semiBold', zIndex: 1 }}
        >
          {t('protection.banner-content')}
        </Text>
        <Button
          backgroundColor="selected"
          sx={{
            borderRadius: '6px',
            '&:hover': { backgroundColor: 'selected' },
            height: '28px',
            maxWidth: '168px',
            px: '5px',
            py: '2px',
            zIndex: 1,
          }}
          onClick={handleClick}
        >
          <Text
            color="link"
            variant="subheader"
            sx={{ fontSize: 1, fontWeight: 'semiBold', lineHeight: '100%' }}
          >
            {t('protection.banner-button')}
          </Text>
        </Button>
      </Flex>
      <Image
        src={staticFilesRuntimeUrl('/static/img/automation.svg')}
        sx={{ position: 'absolute', right: 0, top: 0, opacity: [0.4, 1] }}
      />
    </Banner>
  )
}

import { Icon } from '@makerdao/dai-ui-icons'
import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useScrollToTop } from 'helpers/useScrollToTop'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Box, Grid, Heading, Image, Text } from 'theme-ui'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

const assetsList = {
  logos: [
    { imageName: 'oasisapp_logo_dark' },
    { imageName: 'oasisapp_logo_light', backgroundColor: 'primary100' },
    { imageName: 'oasisapp_logo_black' },
    { imageName: 'oasisapp_logo_white', backgroundColor: 'black' },
  ],
  palmLeaves: [
    { imageName: 'logomark_gradient' },
    { imageName: 'logomark_black' },
    { imageName: 'logomark_white', backgroundColor: 'black' },
  ],
  minimumSizeList: ['digital', 'print'],
  incorrectUseCasesMap: [
    'no-gradient',
    'no-shadow',
    'no-rotate',
    'no-alone',
    'no-stack',
    'no-ratio',
  ],
}

const twoColumnsLayoutBoxSX = {
  gridTemplateColumns: ['repeat(1, 1fr)', 'repeat(2, calc(50% - 16px))'],
  columnGap: 4,
  rowGap: 2,
  gridAutoRows: '1fr',
}

const threeColumnsLayoutBoxSX = {
  ...twoColumnsLayoutBoxSX,
  gridTemplateColumns: ['repeat(1, 1fr)', 'repeat(3, calc(33.333% - 22px))'],
}

const brandAssetsZipUrl = 'https://drive.google.com/drive/folders/1lhDfHoY3uUUuiYlkl8LSuh2GZuNkbEzY'
const BlockHeading = ({
  headingTranslation,
  infoTranslation,
}: {
  headingTranslation: string
  infoTranslation: string
}) => (
  <>
    <Heading variant="header4" sx={{ mb: 2, mt: 88 }}>
      {headingTranslation}
    </Heading>
    <Text variant="paragraph2" sx={{ color: 'neutral80', mb: 2 }}>
      {infoTranslation}
    </Text>
  </>
)

function BrandAssetsPage() {
  useScrollToTop()
  const { t } = useTranslation()
  return (
    <Box sx={{ width: '100%', mt: 5, pb: 7 }}>
      <Heading variant="header2" sx={{ textAlign: 'center', mb: 2 }}>
        {t('brand-assets.heading')}
      </Heading>
      <Text variant="paragraph1" sx={{ color: 'neutral80', textAlign: 'center' }}>
        {t('brand-assets.intro')}
      </Text>
      <AppLink
        variant="inText"
        target="_blank"
        href={brandAssetsZipUrl}
        sx={{
          pt: '8px',
          fontSize: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {`${t('brand-assets.intro-cta')} ${' '}`}
        <Icon
          name="arrow_right"
          size="14px"
          sx={{
            ml: 1,
            position: 'relative',
          }}
        />
      </AppLink>
      <BlockHeading
        headingTranslation={t('brand-assets.category.logo.heading')}
        infoTranslation={t('brand-assets.category.logo.info')}
      />
      <Grid sx={twoColumnsLayoutBoxSX}>
        {assetsList.logos.map((asset) => (
          <Box
            key={asset.imageName}
            bg={asset.backgroundColor || 'neutral10'}
            sx={{
              borderRadius: 12,
              borderColor: 'neutral20',
              borderStyle: 'solid',
              borderWidth: 1,
              display: 'flex',
              mt: 25,
            }}
          >
            <Image
              src={staticFilesRuntimeUrl(`/static/img/brand_assets/${asset.imageName}.svg`)}
              sx={{ height: '75px', margin: '70px auto' }}
            />
          </Box>
        ))}
      </Grid>
      <BlockHeading
        headingTranslation={t('brand-assets.category.palm-leaf.heading')}
        infoTranslation={t('brand-assets.category.palm-leaf.info')}
      />
      <Grid sx={threeColumnsLayoutBoxSX}>
        {assetsList.palmLeaves.map((palmLeaf) => (
          <Box
            key={palmLeaf.imageName}
            bg={palmLeaf.backgroundColor || 'neutral10'}
            sx={{
              borderRadius: 12,
              borderColor: 'neutral20',
              borderStyle: 'solid',
              borderWidth: 1,
              display: 'flex',
              mt: 25,
            }}
          >
            <Image
              src={staticFilesRuntimeUrl(`/static/img/brand_assets/${palmLeaf.imageName}.svg`)}
              sx={{ height: '140px', margin: '30px auto' }}
            />
          </Box>
        ))}
      </Grid>
      <BlockHeading
        headingTranslation={t('brand-assets.category.minimum-size.heading')}
        infoTranslation={t('brand-assets.category.minimum-size.info')}
      />
      <Grid sx={twoColumnsLayoutBoxSX}>
        {assetsList.minimumSizeList.map((minSizeAsset) => (
          <Box>
            <Box
              bg="neutral30"
              sx={{
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                mt: 25,
                mb: 3,
              }}
            >
              <Image
                src={staticFilesRuntimeUrl('/static/img/brand_assets/oasisapp_logo_dark.svg')}
                sx={{
                  height: '75px',
                  mt: 80,
                  mr: 'auto',
                  mb: 10,
                  ml: 'auto',
                  pb: 2,
                  borderBottomStyle: 'dashed',
                  borderBottomWidth: 1,
                  borderBottomColor: 'neutral80',
                }}
              />
              <Text variant="paragraph3" sx={{ color: 'neutral80', mb: 80 }}>
                {t(`brand-assets.category.minimum-size.${minSizeAsset}-minimum-size`)}
              </Text>
            </Box>
            <Text variant="paragraph2" sx={{ color: 'primary100' }}>
              {t(`brand-assets.category.minimum-size.${minSizeAsset}`)}
            </Text>
            <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
              {t(`brand-assets.category.minimum-size.${minSizeAsset}-minimum-size`)}{' '}
              {t('brand-assets.category.minimum-size.width')}
            </Text>
          </Box>
        ))}
      </Grid>
      <BlockHeading
        headingTranslation={t('brand-assets.category.best-practices.heading')}
        infoTranslation={t('brand-assets.category.best-practices.info')}
      />
      <Grid sx={twoColumnsLayoutBoxSX}>
        {assetsList.incorrectUseCasesMap.map((incorrectUseCase) => (
          <Box>
            <Box
              bg="neutral30"
              sx={{
                borderRadius: 12,
                borderColor: 'neutral20',
                borderStyle: 'solid',
                borderWidth: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                mt: 25,
                mb: 3,
                height: 250,
              }}
            >
              <Image
                src={staticFilesRuntimeUrl(
                  `/static/img/brand_assets/incorrect-uses/${incorrectUseCase}.png`,
                )}
                sx={{ width: '60%' }}
              />
            </Box>
            <Text variant="paragraph2" sx={{ color: 'primary100' }}>
              <Icon
                name="close"
                size="12px"
                sx={{
                  ml: 1,
                  mr: 2,
                  position: 'relative',
                  path: {
                    fill: 'critical100',
                  },
                }}
              />
              {t(`brand-assets.category.best-practices.${incorrectUseCase}`)}
            </Text>
          </Box>
        ))}
      </Grid>
    </Box>
  )
}

BrandAssetsPage.layout = MarketingLayout
BrandAssetsPage.layoutProps = {
  topBackground: 'lighter',
  variant: 'marketingSmallContainer',
}
BrandAssetsPage.seoTags = (
  <PageSEOTags
    title="seo.brand-assets.title"
    description="seo.brand-assets.description"
    url="/brand"
  />
)
BrandAssetsPage.theme = 'Landing'

export default BrandAssetsPage

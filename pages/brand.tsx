import { PageSEOTags } from 'components/HeadTags'
import { Icon } from 'components/Icon'
import { MarketingLayout } from 'components/layouts/MarketingLayout'
import { AppLink } from 'components/Links'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useScrollToTop } from 'helpers/useScrollToTop'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Box, Grid, Heading, Image, Text } from 'theme-ui'
import { arrow_right, close } from 'theme/icons'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

const assetsList = {
  logos: [
    {
      imageName: 'logo_color',
      backgroundGradient: 'linear-gradient(181.14deg, #EBFAFF 1%, #FFE7D8 69.98%, #FFCFA3 119.25%)',
    },
    { imageName: 'logo_dark', backgroundColor: 'white' },
    { imageName: 'logo_black' },
    { imageName: 'logo_light', backgroundColor: 'black' },
  ],
  dots: [
    {
      imageName: 'dot_color',
      backgroundGradient: 'linear-gradient(181.14deg, #EBFAFF 1%, #FFE7D8 69.98%, #FFCFA3 119.25%)',
    },
    { imageName: 'dot_dark' },
    { imageName: 'dot_light', backgroundColor: 'black' },
  ],
  minimumSizeList: ['digital', 'print'],
  incorrectUseCasesMap: ['no-color-change', 'no-shadow', 'no-rotate'],
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

const brandAssetsZipUrl = 'https://drive.google.com/drive/folders/1oTs06RTOTgBQC0jtKLip4Shf1Mm4ohmH'
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
    <MarketingLayout topBackground="lighter" variant="marketingSmallContainer">
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
            icon={arrow_right}
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
              sx={{
                borderRadius: 12,
                borderColor: 'neutral20',
                borderStyle: 'solid',
                borderWidth: 1,
                backgroundColor: asset.backgroundColor || 'neutral10',
                backgroundImage: asset.backgroundGradient,
                display: 'flex',
                mt: 25,
              }}
            >
              <Image
                src={staticFilesRuntimeUrl(`/static/img/logos/${asset.imageName}.svg`)}
                sx={{ height: '45px', margin: '70px auto' }}
              />
            </Box>
          ))}
        </Grid>
        <BlockHeading
          headingTranslation={t('brand-assets.category.dot.heading')}
          infoTranslation={t('brand-assets.category.dot.info')}
        />
        <Grid sx={threeColumnsLayoutBoxSX}>
          {assetsList.dots.map((dot) => (
            <Box
              key={dot.imageName}
              sx={{
                borderRadius: 12,
                borderColor: 'neutral20',
                borderStyle: 'solid',
                backgroundColor: dot.backgroundColor || 'neutral10',
                backgroundImage: dot.backgroundGradient,
                borderWidth: 1,
                display: 'flex',
                mt: 25,
              }}
            >
              <Image
                src={staticFilesRuntimeUrl(`/static/img/logos/${dot.imageName}.svg`)}
                sx={{ height: '75px', margin: '30px auto' }}
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
                  src={staticFilesRuntimeUrl('/static/img/logos/logo_black.svg')}
                  sx={{
                    height: '45px',
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
                    `/static/img/logos/incorrect-uses/${incorrectUseCase}.png`,
                  )}
                  sx={{ width: '60%' }}
                />
              </Box>
              <Text variant="paragraph2" sx={{ color: 'primary100' }}>
                <Icon
                  icon={close}
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
    </MarketingLayout>
  )
}

BrandAssetsPage.seoTags = (
  <PageSEOTags
    title="seo.brand-assets.title"
    description="seo.brand-assets.description"
    url="/brand"
  />
)

export default BrandAssetsPage

import { AppLink } from 'components/Links'
import { ListWithIcon } from 'components/ListWithIcon'
import { Toggle } from 'components/Toggle'
import { WithArrow } from 'components/WithArrow'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaEarnFormOrder } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormOrder'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React, { FC } from 'react'
import { Card, Flex, Heading, Image, Text } from 'theme-ui'

const listProps = {
  withIcon: false,
  listStyle: { gap: 1, listStyle: 'outside' },
  itemStyle: { pl: 0, ml: '24px' },
}

interface RewardsHeaderProps {
  image: string
  background: string
  heading: string
}

const RewardsHeader: FC<RewardsHeaderProps> = ({ image, background, heading }) => (
  <Flex sx={{ justifyContent: 'flex-start', gap: '13px', alignItems: 'center' }}>
    <Flex
      sx={{
        background,
        borderRadius: 'ellipse',
        height: '42px',
        width: '42px',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image style={{ height: '16px' }} src={staticFilesRuntimeUrl(image)} />
    </Flex>
    <Heading as="h3" variant="boldParagraph2">
      {heading}
    </Heading>
  </Flex>
)

export const AjnaEarnFormContentNft = () => {
  const { t } = useTranslation()
  const {
    form: {
      updateState,
      state: { nftOpt },
    },
  } = useAjnaProductContext('earn')

  return (
    <>
      <RewardsHeader
        heading={t('ajna.position-page.common.form.nft.token-rewards')}
        image="/static/img/ajna-eye-orange.svg"
        background="linear-gradient(160.26deg, #FFEAEA 5.25%, #FFF5EA 100%)"
      />
      <ListWithIcon
        items={t(`ajna.position-page.common.form.nft.bullet-points.token-rewards`, {
          returnObjects: true,
        })}
        components={{
          2: <AppLink href={EXTERNAL_LINKS.KB.AJNA} sx={{ display: 'inline-block' }} />,
          3: <WithArrow sx={{ fontWeight: 'regular', color: 'interactive100' }} />,
        }}
        {...listProps}
      />
      <RewardsHeader
        heading={t('ajna.position-page.common.form.nft.protocol-rewards')}
        image="/static/img/ajna-eye-purple.svg"
        background="linear-gradient(90deg, #FFEFFD 0%, #F5EDFF 100%), #FFFFFF"
      />
      <ListWithIcon
        items={t(`ajna.position-page.common.form.nft.bullet-points.protocol-rewards`, {
          returnObjects: true,
        })}
        components={{
          2: <AppLink href={EXTERNAL_LINKS.KB.AJNA} sx={{ display: 'inline-block' }} />,
          3: <WithArrow sx={{ fontWeight: 'regular', color: 'interactive100' }} />,
        }}
        {...listProps}
      />
      <Card sx={{ padding: '12px' }}>
        <Flex sx={{ gap: 3 }}>
          <Toggle
            isChecked={!!nftOpt}
            onChange={() => updateState('nftOpt', !nftOpt)}
            withLoading={false}
            sx={{ mt: 1 }}
          />
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('ajna.position-page.common.form.nft.opt')}
          </Text>
        </Flex>
      </Card>
      <AjnaFormContentSummary showReset={false}>
        <AjnaEarnFormOrder />
      </AjnaFormContentSummary>
    </>
  )
}

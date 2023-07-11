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

interface RewardsListProps {
  items: string[]
  link: string
}

const RewardsList: FC<RewardsListProps> = ({ items, link }) => (
  <ListWithIcon
    items={items}
    components={{
      2: <AppLink href={link} sx={{ display: 'inline-block' }} />,
      3: <WithArrow sx={{ fontWeight: 'regular', color: 'interactive100' }} />,
    }}
    withIcon={false}
    listStyle={{ gap: 1, listStyle: 'outside' }}
    itemStyle={{ pl: 0, ml: '24px' }}
  />
)

export const AjnaEarnFormContentNft = () => {
  const { t } = useTranslation()
  const {
    form: {
      updateState,
      state: { isStakingNft },
    },
  } = useAjnaProductContext('earn')

  return (
    <>
      <RewardsHeader
        heading={t('ajna.position-page.common.form.nft.token-rewards')}
        image="/static/img/ajna-eye-orange.svg"
        background="linear-gradient(160.26deg, #FFEAEA 5.25%, #FFF5EA 100%)"
      />
      <RewardsList
        items={t(`ajna.position-page.common.form.nft.bullet-points.token-rewards`, {
          returnObjects: true,
        })}
        // TODO update one article will be available
        link={EXTERNAL_LINKS.DOCS.AJNA.HUB}
      />
      <RewardsHeader
        heading={t('ajna.position-page.common.form.nft.protocol-rewards')}
        image="/static/img/ajna-eye-purple.svg"
        background="linear-gradient(90deg, #FFEFFD 0%, #F5EDFF 100%), #FFFFFF"
      />
      <RewardsList
        items={t(`ajna.position-page.common.form.nft.bullet-points.protocol-rewards`, {
          returnObjects: true,
        })}
        // TODO update one article will be available
        link={EXTERNAL_LINKS.DOCS.AJNA.HUB}
      />
      <Card sx={{ padding: '12px' }}>
        <Flex sx={{ gap: 3 }}>
          <Toggle
            isChecked={!!isStakingNft}
            onChange={() => updateState('isStakingNft', !isStakingNft)}
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

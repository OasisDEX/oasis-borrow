import { EmptyState } from 'components/EmptyState'
import type { GenericSelectOption } from 'components/GenericSelect'
import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { BlogPosts } from 'components/portfolio/blog-posts/BlogPosts'
import { emptyPortfolioPositionNetValueThreshold } from 'components/portfolio/constants'
import { PortfolioPositionBlock } from 'components/portfolio/positions/PortfolioPositionBlock'
import { PortfolioPositionBlockLoadingState } from 'components/portfolio/positions/PortfolioPositionBlockSkeleton'
import { PortfolioPositionFeatured } from 'components/portfolio/positions/PortfolioPositionFeatured'
import { PortfolioPositionLearn } from 'components/portfolio/positions/PortfolioPositionLearn'
import { PortfolioPositionsProductSelect } from 'components/portfolio/positions/PortfolioPositionsProductSelect'
import { PortfolioPositionsSortingSelect } from 'components/portfolio/positions/PortfolioPositionsSortingSelect'
import { PortfolioProductType, PortfolioSortingType } from 'components/portfolio/positions/types'
import type { PortfolioAssetsResponse } from 'components/portfolio/types/domain-types'
import { Toggle } from 'components/Toggle'
import { StatefulTooltip } from 'components/Tooltip'
import { WithArrow } from 'components/WithArrow'
import type { PortfolioPosition, PortfolioPositionsReply } from 'handlers/portfolio/types'
import { EXTERNAL_LINKS, INTERNAL_LINKS } from 'helpers/applicationLinks'
import { getLocalAppConfig } from 'helpers/config'
import { formatAddress } from 'helpers/formatters/format'
import { getGradientColor, summerBrandGradient } from 'helpers/getGradientColor'
import type { BlogPostsReply } from 'helpers/types/blog-posts.types'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { question_o, rays, sparks } from 'theme/icons'
import { Box, Button, Flex, Grid, Heading, Text } from 'theme-ui'

interface PortfolioPositionsViewProps {
  address: string
  blogPosts?: BlogPostsReply
  isOwner: boolean
  portfolioPositionsData?: PortfolioPositionsReply
  portfolioWalletData?: PortfolioAssetsResponse
  migrationPositions?: PortfolioPosition[]
}

type PortfolioPositionsViewFiltersType = {
  product?: PortfolioProductType[]
  showEmptyPositions: boolean
  sorting?: PortfolioSortingType
}

const filterEmptyPosition =
  (isFilterOn: boolean = false) =>
  ({ netValue, isOraclessAndNotEmpty }: PortfolioPosition) => {
    return (
      isFilterOn || netValue >= emptyPortfolioPositionNetValueThreshold || isOraclessAndNotEmpty
    )
  }

export const PortfolioPositionsView = ({
  address,
  migrationPositions,
  blogPosts,
  isOwner,
  portfolioPositionsData,
  portfolioWalletData,
}: PortfolioPositionsViewProps) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  const [filterState, setFilterState] = useState<PortfolioPositionsViewFiltersType>({
    showEmptyPositions: false,
  })

  const updatePortfolioPositionsFilters =
    (changeType: keyof PortfolioPositionsViewFiltersType) =>
    (value: GenericSelectOption | boolean | string[]) => {
      setFilterState((prevState) => ({
        ...prevState,
        // value is either a GenericSelectOption (with value.value), an array (of products) or a boolean (show empty)
        [changeType]: Array.isArray(value) || typeof value === 'boolean' ? value : value.value,
      }))
    }

  const filteredEmptyPositions = useMemo(() => {
    if (!portfolioPositionsData || !migrationPositions) return undefined

    const allPositions = [
      ...portfolioPositionsData.positions,
      ...(getLocalAppConfig('features').EnableMigrations ? migrationPositions : []),
    ]
    // empty positions first
    const positionsWithValue = allPositions.filter(
      filterEmptyPosition(filterState['showEmptyPositions']),
    )
    return positionsWithValue
  }, [filterState, portfolioPositionsData, migrationPositions])

  const filteredPositionsByProduct = useMemo(() => {
    if (!filteredEmptyPositions) return undefined

    // filter by product
    const noneSelected = [0, undefined].includes(filterState['product']?.length) // none selected = "All products"
    const allSelected =
      filterState['product']?.length === Object.values(PortfolioProductType).length // all selected manually
    const includeMigrated = filterState['product']?.includes(PortfolioProductType.migrate) // include migrated positions

    const filteredProductPositions = filteredEmptyPositions.filter((position) => {
      if (noneSelected || allSelected) {
        return true
      }
      return (
        filterState['product']?.includes(
          // filter by product type
          position.type?.toLocaleLowerCase() as PortfolioProductType,
        ) ||
        (includeMigrated && position.availableToMigrate) // special case for migration positions
      )
    })

    return filteredProductPositions
  }, [filterState, filteredEmptyPositions])

  const sortedPositions = useMemo(() => {
    if (!filteredPositionsByProduct) return undefined

    return filteredPositionsByProduct
      .sort((a, b) => {
        if (filterState['sorting'] === PortfolioSortingType.netValueAscending) {
          return a.netValue - b.netValue
        }
        return b.netValue - a.netValue
      })
      .sort((a, b) => {
        // move migration positions to the bottom
        if (a.availableToMigrate) return 1
        if (b.availableToMigrate) return -1
        return 0
      })
  }, [filterState, filteredPositionsByProduct])

  const hiddenPositionsCount = portfolioPositionsData
    ? portfolioPositionsData.positions.length -
      portfolioPositionsData.positions.filter(filterEmptyPosition()).length
    : 0

  const migrationPositionsEmpty = migrationPositions && migrationPositions.length === 0
  const positionsEmpty = portfolioPositionsData && portfolioPositionsData.positions.length === 0

  const renderErrorState = (
    <EmptyState header={tPortfolio('empty-states.no-positions-error')} type="error">
      {tPortfolio('empty-states.try-again')}
    </EmptyState>
  )

  const renderEmptyState = (
    <EmptyState header={tPortfolio('empty-states.no-positions')}>
      {isOwner && tPortfolio('empty-states.owner')}
    </EmptyState>
  )
  const renderPositionsControls = (
    <Flex
      sx={{
        flexDirection: ['column', 'row'],
        justifyContent: 'space-between',
        alignItems: ['flex-start', 'center'],
      }}
      data-testid="portfolio-positions-controls"
    >
      <Flex sx={{ flexDirection: 'row', mt: [2, 0] }}>
        <PortfolioPositionsProductSelect onChange={updatePortfolioPositionsFilters('product')} />
        <PortfolioPositionsSortingSelect onChange={updatePortfolioPositionsFilters('sorting')} />
      </Flex>
      <Flex
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: ['space-between', 'flex-end'],
          mt: [3, 0],
          width: ['100%', 'auto'],
        }}
      >
        <Text variant="paragraph3" sx={{ mr: 1 }}>
          {tPortfolio('show-empty-positions.label', { count: hiddenPositionsCount })}
        </Text>
        <StatefulTooltip
          tooltip={tPortfolio('show-empty-positions.tooltip')}
          containerSx={{ position: 'relative', mr: 1, width: ['40%', 'auto'] }}
          tooltipSx={{
            top: '24px',
            width: ['200px', '250px'],
            fontSize: 1,
            whiteSpace: 'initial',
            textAlign: 'left',
            border: 'none',
            borderRadius: 'medium',
            boxShadow: 'buttonMenu',
          }}
        >
          <Icon size={16} icon={question_o} color="neutral80" />
        </StatefulTooltip>
        <Toggle
          isChecked={filterState['showEmptyPositions']}
          onChange={updatePortfolioPositionsFilters('showEmptyPositions')}
        />
      </Flex>
    </Flex>
  )

  const renderPositionsData = (
    <Flex sx={{ flexDirection: 'column', rowGap: '24px' }}>
      {sortedPositions ? (
        <>
          {sortedPositions.length === 0 ? (
            <EmptyState header={tPortfolio('empty-states.no-filtered-positions')}>
              {isOwner && tPortfolio('empty-states.owner')}
            </EmptyState>
          ) : (
            sortedPositions.map((position) => (
              <PortfolioPositionBlock
                key={`${position.positionId}-${position.protocol}-${position.network}-${position.type}-${position.primaryToken}-${position.secondaryToken}`}
                position={position}
              />
            ))
          )}
        </>
      ) : (
        <Flex sx={{ flexDirection: 'column', rowGap: '24px' }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <PortfolioPositionBlockLoadingState key={`skeleton-${index}`} />
          ))}
        </Flex>
      )}
    </Flex>
  )

  // a quick, crude POC for the rays animation
  const explodeRays = (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const iconsCount = 20
    const raysContainer = document.getElementById('claim-rays')
    if (raysContainer) {
      for (let i = 0; i < iconsCount; i++) {
        // eslint-disable-next-line sonarjs/no-identical-expressions
        const translateX = Math.random() * 300 - Math.random() * 300
        // eslint-disable-next-line sonarjs/no-identical-expressions
        const translateY = Math.random() * 300 - Math.random() * 300
        const raysIcon = document.createElement('div')
        raysIcon.style.position = 'absolute'
        // raysIcon.style.top = `${ev.clientY}px`
        // raysIcon.style.left = `${ev.clientX}px`
        raysIcon.style.zIndex = `${1000 + iconsCount}`
        raysIcon.style.pointerEvents = 'none'
        raysIcon.style.width = `${Math.random() * 20 + 10}px`
        raysIcon.style.height = `${Math.random() * 20 + 10}px`
        raysIcon.style.backgroundImage =
          "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAABBdJREFUSEudlv1rW1UYx7/n9d4kA+2qzNEWO2ZXwl4Yzvk+eyOlFpnUgbXOl+0HQfQHZdjBulWX3EHH/Bf8RQuiCP40AqX4Q1MrVhCdULcWN6tuma107TbXJM3bPXJOcrP0JQq5EC45yX0+z3m+3+c8l2DjiwCgABQAb6O/qGtTjl4nLbsTNWKYZR1oo4tPH2x+OhxPfg8gtxGkcHlSEcpdtn1/rB6AvHKoNcsYd7d9deXcWkj2wkgMlEcp567YGakPMPvS9lHGmMMZd5s+v/QRgAKAYmriy9OE8ShhDISxhP3IC5G6dnC1r32UagDnoIyBMeamul/joWBokEsJShkI54lNzxyuD5A8HB5lnDuM6+AclHOotj0gXCDbsgNccL0DND7/tlVjB9ocxVoiy7kje04xRqOV4EJCcQHoe8P9IPdsBrhAMbM8rAr5P5QUHRA2mLRBpO0wS0Yaek9O1AT8/c5TH7PcylGmM+cSSojyR4MkIAQ8IQ1ECQkiLR24DLDcxr6Txhxk4YMXHXDueISCUNrhMYaCB8f6Zwn89pJ52M880H0EuaszyCV/XbUOaYFKG7QEqQTX9iYLA90OIXxMUQpQBn3PKwI7fQckk1oVqPHseeT/vISbX5yrrPuZ+4DGV04FAWT93qmUaPF4V0xRFi0SgpwCQtkMlP61vINA1xsIOi8bPVOT57H8wwgg7mZOLV17y2041D8EIO8Lv0qDxWPPxvIKUaGU6XFdGt6+D8HOVyG27VpnltRPXyPzy4Qpj0ovY2l+fmjH4Cenqzt/rch09s1Hz9wbsgeVfohLBLpeRzDSty54fm4W6alxFG/OgQob3q0byMxfg+Dc3XLi00p3rwWIxfecQSVE1C+NEVkIhDp6EXqyp1Qik/k3INqWlg1kV7B88UcIKUwDKsrcLYOfGUg1QJ+e1mJ/V1oH1ADP9722KJdo6O2HbGrDjeEPoWteEtaGuj6L1G8zELr5qsxCGIv4AB1cLr7fOaCEjBrPV7x/16ZW605YLe3IXPyuDNAiB6B+n0Z65mdYQiQ8QkAYH/cMiCb8c78qeFXHmuYqffezLbnFz77kIty5Pbyp5923yqfuKr00gC0c7zxAmBhTXCZMeUx3WuPFlZVWb/nWUX0Osfu2gj3QUmkonbnuAVMqYbuBx3rO1gIYSHmCrXPLdM+DWV1XDwSb9+4HYQKBfQdMYC1y2f8Je2/3c7UA/3WcY/pg8xihxAHRMgEZD0MPHYsVqAxEK6USVkLuitQLaBoDYOYvoNxw/K8z5R3z7IWREyWQleBtT9QLaI4BKgoQNxxPVo9H47z85ckBKqwoa31YzwU9v9eJ/H8lcgA1Fo5f3+hoNxA1N/U42br72/JYrQcAhOPJWq8nGqLheoLp15xV179XQl0rXqQ6IgAAAABJRU5ErkJggg==')"
        raysIcon.style.backgroundSize = 'contain'
        raysIcon.style.backgroundRepeat = 'no-repeat'
        raysIcon.style.backgroundPosition = 'center'
        raysIcon.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out'
        raysContainer.appendChild(raysIcon)
        setTimeout(() => {
          setTimeout(() => {
            raysIcon.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${Math.random() * 900}deg)`
          }, 1)
          setTimeout(() => {
            raysIcon.style.opacity = '0'
          }, 2)
          setTimeout(() => {
            raysIcon.remove()
          }, 1000)
        }, Math.random() * 50)
      }
    }
  }

  return (
    <Grid variant="portfolio">
      <Flex sx={{ flexDirection: 'column', rowGap: '24px' }}>
        {portfolioPositionsData?.error ? (
          renderErrorState
        ) : positionsEmpty && migrationPositionsEmpty ? (
          renderEmptyState
        ) : (
          <>
            {renderPositionsControls}
            {renderPositionsData}
          </>
        )}
        <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Heading as="h2" variant="header5" sx={getGradientColor(summerBrandGradient)}>
            <Icon icon={sparks} color="#007DA3" sx={{ mr: 1 }} />
            {tPortfolio(`featured-for-${isOwner ? 'you' : 'address'}`, {
              address: formatAddress(address, 6),
            })}
          </Heading>
          <AppLink href={INTERNAL_LINKS.earn} sx={{ mr: 3 }}>
            <WithArrow sx={{ color: 'neutral80' }}>{tPortfolio('see-all-strategies')}</WithArrow>
          </AppLink>
        </Flex>
        <PortfolioPositionFeatured
          assets={portfolioWalletData?.assets}
          positions={portfolioPositionsData?.positions}
        />
        <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Heading as="h2" variant="header5">
            {tPortfolio('learn-with-summer-fi')}
          </Heading>
          <AppLink href={EXTERNAL_LINKS.BLOG.LEARN} sx={{ mr: 3 }}>
            <WithArrow sx={{ color: 'neutral80' }}>{tPortfolio('see-our-blog')}</WithArrow>
          </AppLink>
        </Flex>
        <PortfolioPositionLearn posts={blogPosts?.learn} />
      </Flex>
      <Box>
        <>
          <Flex sx={{ justifyContent: 'space-between' }}>
            <Flex sx={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text variant="boldParagraph2">Rays Daily Challenge</Text>
            </Flex>
          </Flex>
          <Box sx={{ mt: 3, mb: 4 }}>
            <Text variant="paragraph3">
              Every day you can claim your Rays. Claim Rays for 7 days in a row and get a special
              500 Rays bonus.
            </Text>
            <div
              id="claim-rays"
              style={{ position: 'relative', zIndex: 10, left: '50%', top: '40px' }}
            />
            <Box
              sx={{
                backgroundColor: 'white',
                position: 'relative',
                zIndex: 100,
                margin: '0 auto',
                width: 'fit-content',
                borderRadius: 'round',
              }}
            >
              <Button
                variant="outline"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '0 auto',
                  mt: 4,
                  ...getGradientColor(summerBrandGradient),
                }}
                onClick={explodeRays}
              >
                <Icon icon={rays} color="primary60" sx={{ mr: 3 }} />
                Claim 100 Rays now
              </Button>
            </Box>
          </Box>
        </>
        <BlogPosts posts={blogPosts?.news} />
      </Box>
    </Grid>
  )
}

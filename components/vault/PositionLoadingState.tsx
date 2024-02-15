import { DetailsSection, DetailsSectionTitle } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { Skeleton } from 'components/Skeleton'
import type { VaultHeadlineProps } from 'components/vault/VaultHeadline'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import type { ReactNode } from 'react'
import React from 'react'
import { Container, Flex, Grid } from 'theme-ui'

function ContentCardLoadingState() {
  return (
    <Grid gap="12px" sx={{ mt: '12px', px: 2, '&:nth-child(n+3)': { mb: '-2px' } }}>
      <Skeleton width="50%" />
      <Skeleton height="32px" />
      <Skeleton width="25%" sx={{ mb: 3 }} />
    </Grid>
  )
}

function ContentFooterLoadingState() {
  return (
    <Flex
      as="li"
      sx={{
        gap: '12px',
        alignItems: 'flex-start',
        flexDirection: 'column',
        flexBasis: ['100%', null, null, '25%'],
        p: 3,
        pl: 0,
        '&:nth-child(-n+3)': {
          flexGrow: 1,
        },
      }}
    >
      <Skeleton />
      <Skeleton width="33.3%" />
    </Flex>
  )
}

function SidebarLoadingState() {
  return (
    <Flex sx={{ gap: '12px', flexDirection: 'column', '&:first-child': { mb: 3 } }}>
      <Skeleton width="50%" />
      <Skeleton height="74px" />
    </Flex>
  )
}

export function PositionLoadingOverviewState() {
  return (
    <DetailsSection
      title={
        <DetailsSectionTitle>
          <Skeleton width="150px" height="24px" />
        </DetailsSectionTitle>
      }
      content={
        <DetailsSectionContentCardWrapper>
          <ContentCardLoadingState />
          <ContentCardLoadingState />
          <ContentCardLoadingState />
          <ContentCardLoadingState />
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <DetailsSectionFooterItemWrapper>
          <ContentFooterLoadingState />
          <ContentFooterLoadingState />
          <ContentFooterLoadingState />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}

export function PositionLoadingState({
  header = <Skeleton width="300px" height={4} sx={{ mb: '10px' }} />,
  ...rest
}: Omit<VaultHeadlineProps, 'details' | 'followButtonProps' | 'header' | 'loading'> & {
  header?: ReactNode
}) {
  return (
    <Container variant="vaultPageContainer">
      <VaultHeadline header={header} details={[]} loading={true} {...rest} />
      <Skeleton
        width="150px"
        height={4}
        count={3}
        cols={3}
        gap={4}
        sx={{ mt: '12px', mb: '42px' }}
      />
      <Grid variant="vaultContainer">
        <PositionLoadingOverviewState />
        <SidebarSection
          title={<Skeleton width="150px" height="24px" />}
          content={
            <>
              <SidebarLoadingState />
              <SidebarLoadingState />
            </>
          }
          primaryButton={{ label: '', hidden: true }}
        />
      </Grid>
    </Container>
  )
}

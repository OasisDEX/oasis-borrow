import { DetailsSection, DetailsSectionTitle } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { Skeleton } from 'components/Skeleton'
import { VaultHeadline, VaultHeadlineProps } from 'components/vault/VaultHeadline'
import React from 'react'
import { Container, Grid } from 'theme-ui'

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
    <Grid gap="12px" as="li" sx={{ width: '33.3%', mt: 3, mb: '20px', pr: 3 }}>
      <Skeleton />
      <Skeleton width="33.3%" />
    </Grid>
  )
}

function SidebarLoadingState() {
  return (
    <Grid gap="12px" sx={{ '&:first-child': { mb: 3 } }}>
      <Skeleton width="50%" />
      <Skeleton height="74px" />
    </Grid>
  )
}

export function PositionLoadingState(
  props: Omit<VaultHeadlineProps, 'details' | 'followButtonProps' | 'loading'>,
) {
  return (
    <Container variant="vaultPageContainer">
      <VaultHeadline {...props} details={[]} loading={true} />
      <Skeleton
        width="150px"
        height={4}
        count={3}
        cols={3}
        gap={4}
        sx={{ mt: '12px', mb: '42px' }}
      />
      <Grid variant="vaultContainer">
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

import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { DetailsSection } from 'components/DetailsSection'
import { Skeleton } from 'components/Skeleton'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Box, Button, Flex } from 'theme-ui'

export const Erc4626DetailsSectionContentRewardsLoadingState: FC = () => {
  const { t } = useTranslation()

  return (
    <DetailsSection
      content={
        <AssetsResponsiveTable
          paddless
          rows={[
            {
              items: {
                token: (
                  <Flex sx={{ mt: '6px', ml: '3px' }}>
                    <Skeleton width={38} height={38} circle />
                    <Box sx={{ ml: '12px' }}>
                      <Skeleton width="150px" height="24px" />
                      <Skeleton width="100px" sx={{ mt: 1 }} />
                    </Box>
                  </Flex>
                ),
                action: (
                  <Flex
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      width: '100%',
                      mt: '2px',
                    }}
                  >
                    <Skeleton width="300px" height="24px" />
                    <Skeleton width="300px" sx={{ mt: 1 }} />
                  </Flex>
                ),
              },
            },
          ]}
          verticalAlign="top"
        />
      }
      title={t('erc-4626.position-page.common.vault-token-rewards')}
      footer={
        <Flex sx={{ justifyContent: 'flex-end' }}>
          <Button sx={{ px: 4 }} variant="tertiary" disabled>
            {t('claim')}
          </Button>
        </Flex>
      }
    />
  )
}

import { FlowSidebarSkeleton } from 'components/FlowSidebarSkeleton'
import { ModalCloseIcon } from 'components/Modal'
import { Skeleton } from 'components/Skeleton'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { useOnMobile } from 'theme/useBreakpointIndex'
import { Flex, Text } from 'theme-ui'

interface RefinanceModalSkeletonProps {
  onClose: () => void
}

// Skeleton which handle whole modal UI, in future we may need to split it to smaller pieces
export const RefinanceModalSkeleton: FC<RefinanceModalSkeletonProps> = ({ onClose }) => {
  const isMobile = useOnMobile()
  const { t } = useTranslation()

  return (
    <Flex sx={{ height: ['fit-content', '833px'], flexDirection: 'column', p: 3 }}>
      <Flex sx={{ justifyContent: 'space-between' }}>
        <Flex sx={{ gap: 2, mt: '10px', mb: 4 }}>
          <Skeleton sx={{ width: ['300px', '350px'] }} />
          <Skeleton sx={{ width: '100px', display: ['none', 'block'] }} />
        </Flex>
        <Flex sx={{ width: '32px', height: '32px' }}>
          <ModalCloseIcon close={onClose} sx={{ top: '19px', flex: 1 }} />
        </Flex>
      </Flex>
      {isMobile ? (
        <Text variant="paragraph2">{t('refinance.mobile-not-available')}</Text>
      ) : (
        <Flex sx={{ columnGap: 3, height: '100%' }}>
          <FlowSidebarSkeleton />
          <FlowSidebarSkeleton />
          <FlowSidebarSkeleton />
        </Flex>
      )}
    </Flex>
  )
}

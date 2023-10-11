import { VaultDetailsCardModal } from 'components/vault/VaultDetails'
import type { ModalProps } from 'helpers/modalHook'
import { useModal } from 'helpers/modalHook'
import type { TranslateStringType } from 'helpers/translateStringType'
import type { ReactNode } from 'react'
import React, { useState } from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Flex, Grid, Text } from 'theme-ui'
import { question_o } from 'theme/icons'

import type { DetailsSectionContentCardChangePillProps } from './DetailsSectionContentCard'
import { DetailsSectionContentCardChangePill } from './DetailsSectionContentCard'
import { Icon } from './Icon'

interface DetailsSectionFooterItemWrapperProps {
  children: ReactNode
  columns?: number
}
interface DetailsSectionFooterItemProps {
  title: string
  value: ReactNode
  change?: DetailsSectionContentCardChangePillProps
  modal?: TranslateStringType | JSX.Element
}

function DetailsSectionFooterItemModal({
  close,
  children,
}: ModalProps<{ children: string | JSX.Element }>) {
  return <VaultDetailsCardModal close={close}>{children}</VaultDetailsCardModal>
}

export function DetailsSectionFooterItemWrapper({
  children,
  columns = 3,
}: DetailsSectionFooterItemWrapperProps) {
  return (
    <Grid
      as="ul"
      sx={{
        columnGap: 3,
        rowGap: 0,
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        mt: [0, null, null, -3],
        mb: [0, null, null, -3],
        p: 0,
      }}
    >
      {children}
    </Grid>
  )
}

export function DetailsSectionFooterItem({
  title,
  value,
  change,
  modal,
  sx = {},
}: DetailsSectionFooterItemProps & { sx?: ThemeUIStyleObject }) {
  const openModal = useModal()
  const [isHighlighted, setIsHighlighted] = useState(false)
  const modalHandler = () => {
    if (modal) openModal(DetailsSectionFooterItemModal, { children: modal })
  }
  const hightlightableItemEvents = {
    onMouseEnter: () => setIsHighlighted(true),
    onMouseLeave: () => setIsHighlighted(false),
    onClick: modalHandler,
  }
  const footerItemBackgroundColor = modal && isHighlighted ? 'neutral30' : 'neutral10'
  const cursorStyle = { cursor: modal ? 'pointer' : 'auto' }

  return (
    <Flex
      as="li"
      sx={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        my: 1,
        py: '12px',
        pl: '12px',
        borderRadius: 'medium',
        backgroundColor: footerItemBackgroundColor,
        transition: 'background-color 200ms',
        ...sx,
      }}
    >
      <Text
        variant="paragraph4"
        color="neutral80"
        sx={{ pb: 1, ...cursorStyle }}
        {...hightlightableItemEvents}
      >
        {title}
        {modal && (
          <Icon
            color={isHighlighted ? 'primary100' : 'neutral80'}
            icon={question_o}
            size="auto"
            width="14px"
            height="14px"
            sx={{ position: 'relative', top: '2px', ml: 1, transition: 'color 200ms' }}
          />
        )}
      </Text>
      <Text
        as="p"
        variant="paragraph2"
        sx={{ fontWeight: 'semiBold', ...cursorStyle }}
        {...hightlightableItemEvents}
      >
        {value}
      </Text>
      {(change?.value || change?.isLoading) && (
        <Box sx={{ maxWidth: '100%', mt: 2, ...cursorStyle }} {...hightlightableItemEvents}>
          <DetailsSectionContentCardChangePill {...change} />
        </Box>
      )}
    </Flex>
  )
}

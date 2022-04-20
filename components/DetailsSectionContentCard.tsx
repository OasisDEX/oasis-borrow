import { Icon } from '@makerdao/dai-ui-icons'
import { ModalProps, useModal } from 'helpers/modalHook'
import React, { ReactNode, useState } from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import { VaultDetailsCardModal } from './vault/VaultDetails'

type ChangeVariantType = 'positive' | 'negative'

interface IDetailsSectionContentCardChangePillProps {
  value: string
  variant: ChangeVariantType
}

interface IContentCardProps {
  title: string
  value?: string
  unit?: string
  change?: IDetailsSectionContentCardChangePillProps
  footnote?: string
  link?: {
    label: string
  } & ({ url: string } | { action: () => void }) 
  modal?: string | JSX.Element
}

function DetailsSectionContentCardChangePill({
  value,
  variant,
}: IDetailsSectionContentCardChangePillProps) {
  return (
    <Text
      as="p"
      variant="label"
      sx={{
        px: 3,
        py: 1,
        ...(variant === 'positive' && {
          color: 'onSuccess',
          backgroundColor: 'dimSuccess',
        }),
        ...(variant === 'negative' && {
          color: 'onError',
          backgroundColor: 'dimError',
        }),
        borderRadius: 'mediumLarge',
      }}
    >
      {value}
    </Text>
  )
}

function DetailsSectionContentCardModal({
  close,
  children,
}: ModalProps<{ children: string | JSX.Element }>) {
  return <VaultDetailsCardModal close={close}>{children}</VaultDetailsCardModal>
}

export function DetailsSectionContentCardWrapper({ children }: { children: ReactNode }) {
  return (
    <Grid
      sx={{
        gridTemplateColumns: ['1fr', null, null, '1fr 1fr'],
      }}
    >
      {children}
    </Grid>
  )
}

export function DetailsSectionContentCard({
  title,
  value,
  unit,
  change,
  footnote,
  modal,
}: IContentCardProps) {
  const openModal = useModal()
  const [isHighlighted, setIsHighlighted] = useState(false)
  const modalHandler = () => {
    if (modal) openModal(DetailsSectionContentCardModal, { children: modal })
  }
  const hightlightableItemEvents = {
    onMouseEnter: () => setIsHighlighted(true),
    onMouseLeave: () => setIsHighlighted(false),
    onClick: modalHandler,
  }

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        p: '12px',
        borderRadius: 'medium',
        backgroundColor: modal && isHighlighted ? 'secondaryAlt' : 'surface',
        transition: 'background-color 150ms',
      }}
    >
      <Heading
        as="h3"
        variant="label"
        sx={{ cursor: modal ? 'pointer' : 'auto' }}
        {...hightlightableItemEvents}
      >
        {title}
        {modal && (
          <Icon
            name="question_o"
            size="auto"
            width="12px"
            height="12px"
            sx={{ position: 'relative', top: '2px', ml: 1, pointerEvents: 'auto' }}
          />
        )}
      </Heading>
      <Text
        as="p"
        variant="header2"
        sx={{ cursor: modal ? 'pointer' : 'auto' }}
        {...hightlightableItemEvents}
      >
        {value || '-'}
        {unit && (
          <Text as="small" sx={{ ml: 1, fontSize: 5 }}>
            {unit}
          </Text>
        )}
      </Text>
      {change && (
        <Box sx={{ pt: 2, cursor: modal ? 'pointer' : 'auto' }} {...hightlightableItemEvents}>
          <DetailsSectionContentCardChangePill {...change} />
        </Box>
      )}
      {footnote && (
        <Text
          as="p"
          variant="label"
          sx={{ pt: 2, cursor: modal ? 'pointer' : 'auto' }}
          {...hightlightableItemEvents}
        >
          {footnote}
        </Text>
      )}
    </Flex>
  )
}

import { Icon } from '@makerdao/dai-ui-icons'
import { ModalProps, useModal } from 'helpers/modalHook'
import React, { ReactNode } from 'react'
import { Box, Grid, Heading, Text } from 'theme-ui'

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
    url: string
  }
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
        display: 'inline-block',
        mt: 2,
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
  const modalHandler = () => {
    if (modal) openModal(DetailsSectionContentCardModal, { children: modal })
  }

  return (
    <Box
      onClick={modalHandler}
      sx={{
        p: '12px',
        borderRadius: 'medium',
        backgroundColor: 'surface',
        transition: 'background-color 150ms',
        cursor: modal ? 'pointer' : 'auto',
        ...(modal && {
          '&:hover': {
            backgroundColor: 'secondaryAlt',
          },
        }),
      }}
    >
      <Heading as="h3" variant="label">
        {title}
        {modal && (
          <Icon
            name="question_o"
            size="auto"
            width="12px"
            height="12px"
            sx={{ position: 'relative', top: '2px', ml: 1 }}
          />
        )}
      </Heading>
      <Text as="p" variant="header2">
        {value || '-'}
        {unit && (
          <Text as="small" sx={{ ml: 1, fontSize: 5 }}>
            {unit}
          </Text>
        )}
      </Text>
      {change && <DetailsSectionContentCardChangePill {...change} />}
      {footnote && (
        <Text as="p" variant="label" sx={{ mt: 2 }}>
          {footnote}
        </Text>
      )}
    </Box>
  )
}

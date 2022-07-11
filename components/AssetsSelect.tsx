import { Icon } from '@makerdao/dai-ui-icons'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo } from 'react'
import ReactSelect, { OptionProps, SingleValueProps, ValueType } from 'react-select'
import { Box, Flex } from 'theme-ui'

import { useRedirect } from '../helpers/useRedirect'
import { reactSelectCustomComponents } from './reactSelectCustomComponents'

function OptionWithIcon({ innerProps, isSelected, data }: OptionProps<AssetsSelectOption>) {
  return (
    <Box
      {...innerProps}
      sx={{
        py: 2,
        px: 3,
        bg: isSelected ? 'interactive10' : undefined,
        cursor: 'pointer',
        '&:hover': {
          bg: 'neutral30',
        },
      }}
    >
      <Flex sx={{ alignItems: 'center', fontWeight: 'semiBold' }}>
        <Icon name={data.icon} size="32px" sx={{ mr: 2, ml: 2 }} />
        {data.label}
      </Flex>
    </Box>
  )
}

const InputWithIcon = (props: SingleValueProps<AssetsSelectOption>) => {
  const { value } = props.selectProps
  return (
    <Flex sx={{ alignItems: 'center', fontWeight: 'semiBold' }}>
      <Icon name={`${(value as AssetsSelectOption).icon}`} size="32px" sx={{ mr: 2, ml: 2 }} />
      {(value as AssetsSelectOption).label}
    </Flex>
  )
}

interface AssetsSelectOption {
  label: string
  icon: string
  link: string
}

interface AssetsSelectProps {
  options: AssetsSelectOption[]
  handleChange: () => void
}

export function AssetsSelect({ options, handleChange }: AssetsSelectProps) {
  const { push } = useRedirect()
  const { t } = useTranslation()
  const {
    query: { asset },
    pathname,
  } = useRouter()

  const value = useMemo(() => options.find((option) => option.link.split('/')[2] === asset), [])

  const isSelected = useMemo(
    () => (option: AssetsSelectOption) => asset === option.link.split('/')[2],
    [pathname],
  )

  const handleSelectChange = useCallback((option: ValueType<AssetsSelectOption>) => {
    push((option as AssetsSelectOption).link)
    handleChange && handleChange()
  }, [])

  const assetsSelectComponents = useMemo(
    () => reactSelectCustomComponents<AssetsSelectOption>(),
    [],
  )

  return (
    <ReactSelect<AssetsSelectOption>
      options={options}
      onChange={handleSelectChange}
      components={{
        ...assetsSelectComponents,
        Option: OptionWithIcon,
        SingleValue: InputWithIcon,
      }}
      value={value}
      isOptionSelected={isSelected}
      isSearchable={false}
      placeholder={t('nav.select-an-asset')}
    />
  )
}

import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { Icon } from 'components/Icon'
import type { IconProps } from 'components/Icon.types'
import { TokensGroup } from 'components/TokensGroup'
import { useAppConfig } from 'helpers/config'
import { toggleArrayItem } from 'helpers/toggleArrayItem'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { isEqual, keyBy } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { checkmark, clear_selection, searchIcon } from 'theme/icons'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Button, Flex, Image, Input, Text } from 'theme-ui'
import type { FeaturesEnum } from 'types/config'

export interface GenericMultiselectOption {
  featureFlag?: FeaturesEnum
  icon?: IconProps['icon']
  image?: string
  label: string
  token?: string
  value: string
}

export interface GenericMultiselectProps {
  fitContents?: boolean
  icon?: IconProps['icon']
  initialValues?: string[]
  label: string
  onChange: (value: string[]) => void
  onSingleChange?: (value: string) => void
  options: GenericMultiselectOption[]
  optionGroups?: {
    id: string
    key: string
    options: string[]
  }[]
  sx?: ThemeUIStyleObject
  withSearch?: boolean
}

function GenericMultiselectIcon({
  icon,
  image,
  label,
  token,
}: {
  icon?: IconProps['icon']
  image?: string
  label: string
  token?: string
}) {
  return (
    <Box sx={{ flexShrink: 0, my: '-4px', mr: '12px', ...(image && { p: '3px' }) }}>
      {token && <TokensGroup tokens={[token]} forceSize={32} />}
      {icon && <Icon size={32} icon={icon} sx={{ verticalAlign: 'bottom' }} />}
      {image && (
        <Image
          src={image}
          alt={label}
          sx={{ width: '26px', height: '26px', verticalAlign: 'bottom' }}
        />
      )}
    </Box>
  )
}

function GenericMultiselectItem({
  hasCheckbox = true,
  icon,
  image,
  isClearing = false,
  isDisabled = false,
  isSelected = false,
  label,
  onClick,
  token,
  value,
}: {
  hasCheckbox?: boolean
  isClearing?: boolean
  isDisabled?: boolean
  isSelected?: boolean
  onClick: (value: string) => void
} & GenericMultiselectOption) {
  return (
    <Box
      as="li"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        py: isClearing ? '18px' : '12px',
        pr: 3,
        pl: hasCheckbox ? '44px' : 2,
        fontSize: 3,
        fontWeight: 'regular',
        color: isDisabled ? 'neutral80' : 'primary100',
        borderRadius: isClearing ? 'none' : 'medium',
        transition: 'color 200ms, background-color 200ms',
        cursor: isDisabled ? 'default' : 'pointer',
        whiteSpace: 'nowrap',
        borderBottom: isClearing ? '1px solid' : 'none',
        borderColor: 'neutral30',
        '&:hover': {
          backgroundColor: isDisabled || isClearing ? 'transparent' : 'neutral30',
          fontWeight: !isDisabled && isClearing ? 'semiBold' : 'regular',
        },
      }}
      onClick={() => {
        if (!isDisabled) onClick(value)
      }}
    >
      {hasCheckbox && (
        <Box
          sx={{
            position: 'absolute',
            top: '12px',
            left: 2,
            width: '24px',
            height: '24px',
            backgroundColor: isSelected ? 'success10' : 'neutral10',
            border: '1px solid',
            borderColor: isSelected ? 'success100' : 'neutral60',
            borderRadius: 'small',
            transition: 'background-color 100ms, border-color 100ms',
          }}
        >
          <Icon
            size={12}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              margin: 'auto',
              opacity: isSelected ? 1 : 0,
              transition: 'opacity 100ms',
            }}
            icon={checkmark}
            color="success100"
          />
        </Box>
      )}
      {isClearing && (
        <Icon
          size={24}
          icon={clear_selection}
          sx={{ mr: 3, opacity: isDisabled ? 0.5 : 1, transition: '200ms opacity' }}
        />
      )}
      {(icon || image || token) && (
        <GenericMultiselectIcon label={label} icon={icon} image={image} token={token} />
      )}
      {label}
    </Box>
  )
}

export function GenericMultiselect({
  fitContents = false,
  icon,
  initialValues = [],
  label,
  onChange,
  onSingleChange,
  optionGroups,
  options,
  sx,
  withSearch,
}: GenericMultiselectProps) {
  const { t } = useTranslation()

  const didMountRef = useRef(false)
  const [values, setValues] = useState<string[]>(initialValues)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [search, setSearch] = useState<string>('')
  const outsideRef = useOutsideElementClickHandler(() => setIsOpen(false))
  const scrollRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const features = useAppConfig('features')

  const matchingOptionsGroup = useMemo(() => {
    return optionGroups?.filter(({ options: _options }) => isEqual(_options, values))?.[0]?.id
  }, [optionGroups, values])

  const selectLabel = useMemo(() => {
    switch (values.length) {
      case 0:
        return (
          <>
            {icon && <Icon icon={icon} size={32} sx={{ flexShrink: 0, mr: '12px' }} />}
            {t('all')} {label.toLowerCase()}
          </>
        )
      case 1:
        const selected = options.filter((item) => item.value === values[0])[0]
        return (
          <>
            {(selected.icon || selected.image || selected.token) && (
              <GenericMultiselectIcon
                icon={selected.icon}
                image={selected.image}
                label={selected.label}
                token={selected.token}
              />
            )}
            {selected.label}
          </>
        )
      default:
        return optionGroups && matchingOptionsGroup ? (
          <>
            {t('all')} {t(keyBy(optionGroups, 'id')[matchingOptionsGroup].key)}
          </>
        ) : (
          <>
            {icon && <Icon icon={icon} size={32} sx={{ flexShrink: 0, mr: '12px' }} />}
            {t('selected')} {label.toLowerCase()}: {values.length}
          </>
        )
    }
  }, [icon, label, matchingOptionsGroup, optionGroups, options, values])

  const filteredOptions = useMemo(
    () =>
      options
        .filter(({ featureFlag }) => (featureFlag !== undefined ? features[featureFlag] : true))
        .filter(({ label: _label }) =>
          search.length ? _label.toLowerCase().includes(search.toLowerCase()) : true,
        ),
    [features, options, search],
  )

  useEffect(() => {
    if (didMountRef.current) onChange(values)
    else didMountRef.current = true
  }, [values])

  return (
    <Box sx={{ position: 'relative', userSelect: 'none', ...sx }} ref={outsideRef}>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'stretch',
          height: '56px',
          pr: '42px',
          pl: 3,
          border: '1px solid',
          borderColor: isOpen ? 'primary100' : 'secondary100',
          borderRadius: 'medium',
          backgroundColor: 'neutral10',
          cursor: 'pointer',
          transition: 'border-color 200ms',
          '&:hover': {
            borderColor: isOpen ? 'primary100' : 'neutral70',
          },
        }}
        onClick={() => {
          setIsOpen((_isOpen) => {
            if (!isOpen && searchRef.current) {
              setSearch('')
              searchRef.current.focus()
            }

            return !_isOpen
          })
        }}
      >
        <Text
          sx={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 2,
            fontWeight: 'semiBold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {selectLabel}
          <ExpandableArrow
            size={12}
            direction={isOpen ? 'up' : 'down'}
            sx={{
              position: 'absolute',
              top: 0,
              right: '18px',
              bottom: 0,
              my: 'auto',
            }}
          />
        </Text>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          minWidth: '100%',
          mt: 1,
          p: 2,
          border: '1px solid',
          borderColor: 'secondary100',
          borderRadius: 'medium',
          backgroundColor: 'neutral10',
          boxShadow: 'buttonMenu',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-5px)',
          pointerEvents: isOpen ? 'auto' : 'none',
          zIndex: 1,
          transition: 'opacity 200ms, transform 200ms',
        }}
      >
        <Flex
          ref={scrollRef}
          as="ul"
          sx={{
            flexDirection: 'column',
            rowGap: 2,
            maxHeight: fitContents ? 'auto' : '342px',
            pl: 0,
            pr: 2,
            overflowX: 'hidden',
            overflowY: 'scroll',
            '&::-webkit-scrollbar': {
              width: '6px',
              borderRadius: 'large',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'secondary100',
              borderRadius: 'large',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'secondary60',
              borderRadius: 'large',
            },
          }}
        >
          <GenericMultiselectItem
            hasCheckbox={false}
            isClearing={true}
            isDisabled={values.length === 0}
            label={t('clear-selection')}
            onClick={() => {
              setValues([])
              setIsOpen(false)
            }}
            value=""
          />
          {withSearch && (
            <Box as="li" sx={{ position: 'relative', color: 'neutral80' }}>
              <Icon
                icon={searchIcon}
                size="24px"
                sx={{ position: 'absolute', top: 3, left: 3, pointerEvens: 'none' }}
              />
              <Input
                ref={searchRef}
                type="text"
                autoComplete="off"
                placeholder={`${t('search')} ${label.toLowerCase()}`}
                value={search}
                variant="text.paragraph3"
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  height: '46px',
                  p: 2,
                  pl: '44px',
                  color: 'primary100',
                  border: '1px solid',
                  borderColor: 'neutral20',
                  borderRadius: 'medium',
                  '&:focus': {
                    outline: 'none',
                  },
                  '::placeholder': {
                    color: 'primary30',
                  },
                }}
              />
            </Box>
          )}
          {optionGroups && optionGroups.length > 0 && (
            <Flex as="li" sx={{ columnGap: 1 }}>
              {optionGroups.map(({ id, key, options: _options }) => (
                <Button
                  key={id}
                  variant="tag"
                  sx={{
                    flexShrink: 0,
                    px: 3,
                    whiteSpace: 'nowrap',
                    ...(matchingOptionsGroup === id && {
                      '&, &:hover': {
                        color: 'neutral10',
                        bg: 'interactive100',
                        borderColor: 'interactive100',
                      },
                    }),
                  }}
                  onClick={() => {
                    if (matchingOptionsGroup === id) setValues([])
                    else {
                      setValues(_options)
                      onSingleChange?.(`Group: ${id}`)
                    }
                  }}
                >
                  {t(key)} ({_options.length})
                </Button>
              ))}
            </Flex>
          )}
          {filteredOptions.map((option) => (
            <GenericMultiselectItem
              key={option.value}
              isSelected={values.includes(option.value)}
              onClick={(value) => {
                setValues(toggleArrayItem<string>(values, value))
                onSingleChange?.(value)
              }}
              {...option}
            />
          ))}
          {filteredOptions.length === 0 && (
            <Box as="li">
              <Text as="p" variant="paragraph3" sx={{ mx: 1, my: 1 }}>
                {t('empty-options-list')}
              </Text>
            </Box>
          )}
        </Flex>
      </Box>
    </Box>
  )
}

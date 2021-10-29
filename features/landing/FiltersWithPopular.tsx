import { Icon } from '@makerdao/dai-ui-icons'
import { Pages, trackingEvents } from 'analytics/analytics'
import { COIN_TAGS } from 'blockchain/tokensMetadata'
import { TagFilter } from 'features/ilks/popularIlksFilters'
import { useTranslation } from 'next-i18next'
import React, { ChangeEvent, memo, useCallback } from 'react'
import ReactSelect from 'react-select'
import { Box, Button, Flex, Input, SxStyleProp } from 'theme-ui'

interface FiltersProps {
  onSearch: (search: string) => void
  onTagChange: (tag: TagFilter) => void
  search: string
  defaultTag: 'your-vaults' | 'all-assets'
  page: Pages.LandingPage | Pages.OpenVaultOverview | Pages.VaultsOverview | Pages.AllAssets
  tagFilter: TagFilter
  searchPlaceholder: string
  sx?: SxStyleProp
}

export function SearchInput({
  onChange,
  page,
  search,
  searchPlaceholder,
  sx,
}: {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
} & Pick<FiltersProps, 'page' | 'search' | 'searchPlaceholder' | 'sx'>) {
  return (
    <Flex
      sx={{
        variant: 'forms.search',
        width: ['100%', '100%', '313px'],
        ml: 'auto',
        mt: [3, 3, 0],
        ...sx,
      }}
    >
      <Icon
        sx={{
          position: 'relative',
          top: '6px',
          ml: 3,
        }}
        name="search"
        size="4"
      />
      <Input
        sx={{ fontWeight: 'heading' }}
        variant="plain"
        onChange={onChange}
        onBlur={() => trackingEvents.searchToken(page, search)}
        value={search}
        placeholder={searchPlaceholder}
      />
    </Flex>
  )
}

function Filters_({
  onSearch,
  search,
  onTagChange,
  tagFilter,
  defaultTag,
  page,
  searchPlaceholder,
  sx,
}: FiltersProps) {
  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onSearch(e.currentTarget.value)
    },
    [onSearch],
  )
  const { t } = useTranslation()

  const options: { value: TagFilter; label: string }[] = [
    {
      value: 'popular',
      label: t('filters.popular'),
    },
    {
      value: undefined,
      label: t(defaultTag),
    },
    ...COIN_TAGS.map((tag) => ({
      value: tag,
      label: t(`filters.${tag}`),
    })),
  ]

  const selected = options.find((option) => option.value === tagFilter)

  return (
    <Flex sx={{ ...sx, flexDirection: ['column', 'column', 'row'], mb: 4 }}>
      <Box
        sx={{
          display: ['none', 'flex', 'flex'],
        }}
      >
        {options.map((option) => (
          <Button
            key={option.label}
            onClick={() => onTagChange(option.value)}
            sx={{ mr: 2 }}
            data-selected={option.value === tagFilter}
            variant="filter"
          >
            {option.label}
          </Button>
        ))}
      </Box>
      <Box
        sx={{
          my: 2,
          display: ['block', 'none', 'none'],
        }}
      >
        <ReactSelect
          value={selected}
          defaultValue={options[0]}
          options={options}
          isSearchable={false}
          onChange={(option) => option && 'value' in option && onTagChange(option.value)}
          components={{
            IndicatorsContainer: ({ selectProps: { menuIsOpen } }) => (
              <Flex
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  mr: 3,
                  transform: `rotate(${menuIsOpen ? '180deg' : 0})`,
                  transition: 'transform 0.2s ease-in-out',
                }}
              >
                <Icon name="chevron" />
              </Flex>
            ),
            Control: ({ children, innerProps }) => (
              <Flex
                sx={{
                  border: 'light',
                  px: 2,
                  py: 3,
                  borderRadius: 'medium',
                  cursor: 'pointer',
                }}
                {...innerProps}
              >
                {children}
              </Flex>
            ),
          }}
        />
      </Box>
      <SearchInput {...{ onChange, search, page, searchPlaceholder }} />
    </Flex>
  )
}

export const FiltersWithPopular = memo(Filters_)

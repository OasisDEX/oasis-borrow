import { GenericMultiselect } from 'components/GenericMultiselect'
import { GenericSelect } from 'components/GenericSelect'
import type { DiscoverFiltersListItem } from 'features/discover/meta'
import { DiscoverFilterType } from 'features/discover/types'
import React from 'react'

export function DiscoverFilter({
  filter,
  item,
  onChange,
}: {
  filter: string
  item: DiscoverFiltersListItem
  onChange: (key: string, currentValue: string) => void
}) {
  switch (item.type) {
    case DiscoverFilterType.SINGLE:
      return (
        <GenericSelect
          options={item.options}
          defaultValue={item.options[0]}
          onChange={(currentValue) => {
            onChange(filter, currentValue.value)
          }}
        />
      )
    case DiscoverFilterType.MULTI:
      return (
        <GenericMultiselect
          {...item}
          onChange={(value) => {
            onChange(filter, value.join(','))
          }}
        />
      )
    default:
      return null
  }
}

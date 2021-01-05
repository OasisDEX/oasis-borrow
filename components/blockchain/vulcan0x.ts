import { flattenDepth, fromPairs, isEmpty, toPairs, uniqBy } from 'lodash'
import { Observable, throwError } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

function filterize(filter: any): string {
  switch (typeof filter) {
    case 'number':
      return `${filter}`
    case 'string':
      return `"${filter}"`
    case 'object':
      return filter instanceof Placeholder
        ? `$${filter.name}`
        : filter.length === undefined
        ? '{' +
          toPairs(filter)
            .map(([k, v]) => `${k}: ${filterize(v)}`)
            .join(', ') +
          '}'
        : '[' + (filter as []).map((v: any) => filterize(v)).join(', ') + ']'
    default:
      throw new Error(`unknown filter type: ${typeof filter}`)
  }
}

function placeholders(object: any): Placeholder[] {
  switch (typeof object) {
    case 'object':
      return object instanceof Placeholder
        ? [object]
        : object.length === undefined
        ? flattenDepth(
            Object.values(object).map((o: any) => placeholders(o)),
            1,
          )
        : flattenDepth(
            object.map((o: any) => placeholders(o)),
            1,
          )
    default:
      return []
  }
}

export class Placeholder {
  public name: string
  public type: string
  public value: any
  constructor(name: string, type: string, value: any) {
    this.name = name
    this.type = type
    this.value = value
  }
}

const optionsMap = {
  timeUnit: 'timeUnit',
  tzOffset: 'tzOffset',
  dateFrom: 'dateArg',
  baseGem: 'baseGemArg',
  quoteGem: 'quoteGemArg',
} as { [param: string]: string }

export function vulcan0x<R>(
  url: string,
  id: string,
  resource: string,
  fields: string[],
  {
    params,
    filter,
    order,
    limit,
    offset,
  }: {
    params?: Placeholder[]
    filter?: any
    order?: string
    limit?: number
    offset?: number
  },
): Observable<R[]> {
  const options = toPairs({
    ...(params ? fromPairs(params.map(({ name }) => [optionsMap[name], `$${name}`]) as any) : {}),
    ...(filter ? { filter: filterize(filter) } : {}),
    ...(order ? { orderBy: order } : {}),
    ...(limit ? { first: '$limit' } : {}),
    ...(offset ? { offset: '$offset' } : {}),
  })
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
  const variables = [
    ...(params || []),
    ...uniqBy(placeholders(filter), 'name'),
    ...(limit ? [new Placeholder('limit', 'Int', limit)] : []),
    ...(offset ? [new Placeholder('offset', 'Int', offset)] : []),
  ]
  const queryParams = isEmpty(variables)
    ? ''
    : `(${variables.map(({ name, type }) => `$${name}: ${type}`).join(', ')})`

  // console.log('process.env.REACT_APP_GRAPHQL_DEVMODE', process.env.REACT_APP_GRAPHQL_DEVMODE);

  return ajax({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      query:
        `query ${id}${queryParams} {\n` +
        `    ${resource}(\n${options}\n) {\n` +
        `      nodes { ${fields.join(' ')} }\n` +
        '    }\n' +
        '}',
      variables: {
        ...fromPairs(variables.map(({ name, value }) => [name, value])),
        ...(process.env.REACT_APP_GRAPHQL_DEVMODE
          ? { devMode: process.env.REACT_APP_GRAPHQL_DEVMODE }
          : {}),
      },
      operationName: id,
    },
  }).pipe(
    map(({ response }) => {
      if (response.errors && response.errors[0]) {
        console.log('Vulcan0x error', response.errors)
        throw new Error(response.errors[0].message)
      }
      return (Object.values(response.data)[0] as { nodes: R[] }).nodes
    }),
    catchError((error) => {
      console.error('Vulcan0x error...', error)
      return throwError(error)
    }),
  )
}

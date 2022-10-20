import { Prisma } from '@prisma/client'
import { DiscoverDataResponse } from 'features/discover/api'
import { DiscoverTableRowData } from 'features/discover/types'

const AMOUNT_OF_ROWS = 10

export async function parseDiscoverDatabaseRequest<
  TResponse,
  TData extends DiscoverTableRowData
>({
  client,
  where = {},
  select,
  transformer,
}: {
  client: Prisma.HighRiskDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>
  select?: { [key: string]: boolean }
  where?: { [key: string]: Prisma.StringFilter }
  transformer: (response: TResponse[]) => TData[]
}): Promise<DiscoverDataResponse> {
  const response = (await client.findMany({
    take: AMOUNT_OF_ROWS,
    where,
    select,
  })) as TResponse[]

  return { rows: transformer(response) }
}

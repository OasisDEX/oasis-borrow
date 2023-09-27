import type { ProductHubItems } from '@prisma/client'

// removing the ID cause it's not needed in the frontend
export const filterTableData = ({ id, ...table }: ProductHubItems) => table

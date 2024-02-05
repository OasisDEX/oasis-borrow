import type { MarketingTemplateProductBoxProps } from 'features/marketing-layouts/types'

export function getGridTemplateAreas(products: MarketingTemplateProductBoxProps[]) {
  return products
    .reduce<string[][]>((total, { composition }, i) => {
      return total[total.length - 1] && total[total.length - 1].length === 1
        ? [
            ...total.slice(0, total.length - 1),
            [
              ...(composition === 'narrow'
                ? [...total[total.length - 1], `p-${i}`]
                : [
                    [...total[total.length - 1], '.'],
                    [`p-${i}`, `p-${i}`],
                  ].flat()),
            ],
          ]
        : [
            ...total,
            [
              ...(composition === 'narrow'
                ? [`p-${i}`, ...(products.length === i + 1 ? ['.'] : [])]
                : [`p-${i}`, `p-${i}`]),
            ],
          ]
    }, [])
    .map((item) => `"${item.join(' ')}"`)
    .join(' ')
}

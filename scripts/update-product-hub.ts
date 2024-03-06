import dotenv from 'dotenv'
import fetch from 'node-fetch'
dotenv.config()

export const updateProductHub = async () => {
  const result = await fetch('http://localhost:3000/api/product-hub', {
    method: 'PATCH',
    body: JSON.stringify({
      protocols: ['ajna', 'aavev2', 'aavev3', 'maker', 'sparkv3', 'morphoblue'],
    }),
    headers: {
      'Content-Type': 'application/json',
      authorization: `${process.env.PRODUCT_HUB_KEY}`,
    },
  })
  console.info(`Status: ${result.status}`)
  const data = await result.text()
  console.info(data)
}

updateProductHub().catch((e) => console.error(e))

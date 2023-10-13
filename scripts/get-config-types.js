const { generateOasisBorrowConfigTypes } = require('./config-type-generators/oasis-borrow')
const { generateDomainConfigTypes } = require('./config-type-generators/domain')

const main = async () => {
  await generateOasisBorrowConfigTypes.catch((error) => {
    console.error(`Error generating Oasis Borrow config types: ${error}`)
  })
  await generateDomainConfigTypes.catch((error) => {
    console.error(`Error generating Domain config types: ${error}`)
  })
}

void main()

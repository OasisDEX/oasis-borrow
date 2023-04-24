import '@testing-library/jest-dom'

// import '@testing-library/react/'
import { Jest } from '@jest/environment'
import Chai from 'chai'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import SinonChai from 'sinon-chai'

// const localStorageMock = (jest: Jest) => {
//   if (localStorage === undefined) {
//     localStorage = new LocalStorage(jest)
//   }
//   if (sessionStorage === undefined) {ś
//     sessionStorage = new LocalStorage(jest)
//   }
// }

const configureEnzyme = () => {
  Enzyme.configure({ adapter: new Adapter() })
}

const configureChai = () => {
  Chai.use(SinonChai)
}
export default (jest: Jest) => {
  jest.useFakeTimers()
  // localStorageMock(jest)
  configureEnzyme()
  configureChai()
}

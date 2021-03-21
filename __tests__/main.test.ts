import { getPythonVersion, hashString } from '../src/utils'

test('get python version', async () => {
  const pyVersion = await getPythonVersion()
  expect(pyVersion.startsWith('Python 3.')).toBe(true)
})

test('hash string', () => {
  expect(typeof hashString('s')).toBe('string')
})

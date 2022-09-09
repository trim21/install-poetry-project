import * as exec from '@actions/exec'

import * as poetry from '../src/poetry'

let shouldReturnPoetryVersion = '1.1.2'
const mockFn = jest.fn()

beforeEach(() => {
  jest.spyOn(exec, 'exec').mockImplementation(async (commandLine: string, args?: string[], options?: exec.ExecOptions) => {
    mockFn(commandLine, args)
    if (args?.[0] === '--version') {
      options?.listeners?.stdout?.(Buffer.from(shouldReturnPoetryVersion))
    }
    if (args?.[0] === 'install') {
      return 0
    }
    return 0
  })
})

test('get poetry version', async () => {
  const poetryVersion = await poetry.getVersion()
  expect(poetryVersion).toMatch(/^\d+\.\d+\.\d+$/)
})

test('get install without --remove-untracked args', async () => {
  shouldReturnPoetryVersion = '1.0.5'
  await poetry.install(['e1'], ['--another'])
  expect(mockFn).toBeCalledWith('poetry', ['install', '-E', 'e1', '--another'])
})

test('get install with --remove-untracked args', async () => {
  await poetry.install(['e1'], ['--another'])
  expect(mockFn).toBeCalledWith('poetry', ['install', '-E', 'e1', '--another', '--remove-untracked'])
})

// test('config', async () => {
//   await poetry.config('kkk', 'vvv')
//   expect(mockFn).toBeCalledWith('poetry', ['config', 'kkk', 'vvv'])
// })

afterEach(() => {
  jest.clearAllMocks()
  mockFn.mockReset()
  shouldReturnPoetryVersion = '1.1.2'
})

import { existsSync } from 'fs'

import * as core from '@actions/core'
import { exec } from '@actions/exec'

import { enableVenv, getPythonVersion, isWindows } from './utils'
import * as cache from './cache'
import * as poetry from './poetry'

async function run (): Promise<void> {
  const extras = core
    .getInput('extras', { required: false })
    .split('\n')
    .filter(x => x !== '')
  extras.sort()

  const additionalArgs = core
    .getInput('install_args', { required: false })
    .split(' ')
    .filter(x => x !== '')

  const pythonVersion = await getPythonVersion()
  const poetryVersion = await poetry.getVersion()
  core.info(`python version: ${pythonVersion}`)
  core.info(`poetry version: ${poetryVersion}`)

  await cache.restore(pythonVersion, poetryVersion, extras)

  await poetry.config('virtualenvs.in-project', 'true')
  if (isWindows() && !existsSync('.venv')) {
    await exec('python -m venv .venv')
  }
  await poetry.install(extras, additionalArgs)

  await cache.setup(pythonVersion, poetryVersion, extras)
  enableVenv()
}

run().catch(e => {
  core.setFailed(e)
  throw e
})

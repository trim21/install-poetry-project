import * as core from '@actions/core'

import { enableVenv, getPythonVersion } from './utils'
import { restore, setup } from './cache'
import * as poetry from './poetry'

async function run (): Promise<void> {
  const extras = core
    .getInput('extras', { required: false })
    .split('\n')
    .filter(x => x !== '')
  extras.sort()

  const pythonVersion = await getPythonVersion()

  await restore(pythonVersion, extras)
  await poetry.config('virtualenvs.in-project', 'true')
  await poetry.install(extras)
  await setup(pythonVersion, extras)
  enableVenv()
}

run().catch(e => {
  core.setFailed(e)
  process.exit(1)
})

import * as path from 'path'
import * as fs from 'fs'

import * as core from '@actions/core'

import { getPythonVersion } from './utils'
import { restore, setup } from './cache'
import { install } from './poetry'
import { PYTHONUSERBASE } from './constants'

async function run (): Promise<void> {
  const extras = core
    .getInput('extras', { required: false })
    .split('\n')
    .filter(x => x !== '')
  extras.sort()

  const pythonVersion = await getPythonVersion()

  await restore(pythonVersion, extras)
  await install(extras)
  await setup(pythonVersion, extras)

  core.exportVariable('PYTHONUSERBASE', PYTHONUSERBASE)
  addPathForUserInstalledPackage()
}

function addPathForUserInstalledPackage () {
  if (process.platform === 'linux' || process.platform === 'darwin') {
    core.addPath(path.join(PYTHONUSERBASE, 'bin'))
  } else if (process.platform === 'win32') {
    fs.readdirSync(PYTHONUSERBASE).forEach(file => {
      core.addPath(path.join(PYTHONUSERBASE, file, 'Scripts'))
    })
  }
}

run().catch(e => {
  core.setFailed(e)
  process.exit(1)
})

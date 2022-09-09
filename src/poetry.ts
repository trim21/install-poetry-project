import * as fs from 'fs/promises'

import * as semver from 'semver'
import { exec } from '@actions/exec'

export async function config (key: string, value: string): Promise<void> {
  const env: Record<string, string> = {}
  Object.keys(process.env).forEach((key: string) => {
    const v = process.env[key]
    if (v) {
      env[key] = v.toString()
    }
  })

  console.log(JSON.stringify(env, null, '  '))

  const option = { env }
  await exec('echo', ['hello'], option)
  await exec('poetry', ['config', '--list'], option)
  await exec('poetry', [], option)

  let myStdout = ''
  let myStderr = ''

  const args = ['-vvv', 'config', key, value]
  try {
    await exec('poetry', args, {
      env,
      listeners: {
        stderr: (data: Buffer) => {
          myStderr += data.toString()
        },
        stdout: (data: Buffer) => {
          myStdout += data.toString()
        }
      }
    })
  } catch (e) {

  }

  await fs.mkdir('/home/runner/debug')
  await fs.writeFile('/home/runner/debug/stdout', myStdout)
  await fs.writeFile('/home/runner/debug/stderr', myStderr)

  throw new Error(myStdout)
}

export async function install (extras: string[], additionalArgs: string[]): Promise<void> {
  const args = ['install']
  for (const extra of extras) {
    args.push('-E', extra)
  }
  if (additionalArgs.length) {
    args.push(...additionalArgs)
  }

  if (semver.gte(await getVersion(), '1.1.0')) {
    args.push('--remove-untracked')
  }

  await exec('poetry', args, {
    env: {
      PATH: process.env.PATH || '',
      PYTHONIOENCODING: 'utf-8',
    }
  })
}

export async function getVersion (): Promise<string> {
  let myOutput = ''
  const options = {
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        myOutput += data.toString()
      }
    }
  }

  await exec('poetry', ['--version'], options)
  return myOutput.replace('Poetry version ', '')
}

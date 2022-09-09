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

  const args = ['-vvv', 'config', key, value]

  await exec('poetry', args, {
    env,
  })
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

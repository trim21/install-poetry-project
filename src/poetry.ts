import { exec } from '@actions/exec'
import { PYTHONUSERBASE } from './constants'

export async function install (extras: string[]): Promise<void> {
  const args = ['install']
  for (const extra of extras) {
    args.push('-E', extra)
  }
  await exec('poetry', args, {
    env: {
      POETRY_VIRTUALENVS_CREATE: 'false',
      PYTHONUSERBASE,
      PIP_USER: '1',
      PATH: process.env.PATH || '',
    }
  })
}

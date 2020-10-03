import { exec } from '@actions/exec'

export async function config (key: string, value: string): Promise<void> {
  const args = ['config', key, value]
  await exec('poetry', args, {
    env: {
      PATH: process.env.PATH || '',
    }
  })
}

export async function install (extras: string[]): Promise<void> {
  const args = ['install']
  for (const extra of extras) {
    args.push('-E', extra)
  }
  await exec('poetry', args, {
    env: {
      PATH: process.env.PATH || '',
      PYTHONIOENCODING: 'utf-8',
    }
  })
}

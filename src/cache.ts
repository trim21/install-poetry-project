import * as cache from '@actions/cache'
import * as fs from 'fs'
import * as core from '@actions/core'
import { IN_PROJECT_VENV_PATH } from './constants'
import { hashString } from './utils'

function cacheKeyComponents (pyVersion: string, extras: string[]): string[] {
  return [
    'poetry',
    'deps',
    '2',
    process.platform,
    hashString(pyVersion),
    poetryLockCacheKey(),
    hashString(extras.join('_')),
  ]
}

function fallbackKeys (pyVersion: string, extras: string[]): string[] {
  const keys = []
  const components = cacheKeyComponents(pyVersion, extras)
  for (let index = 5; index < components.length; index++) {
    keys.unshift(components.slice(0, index).join('-'))
  }
  return keys
}

function poetryLockCacheKey () {
  return hashString(fs.readFileSync('poetry.lock').toString())
}

export async function setup (
  pythonVersion: string,
  extras: string[]
): Promise<void> {
  try {
    const key = cacheKeyComponents(pythonVersion, extras).join('-')
    core.info(`cache with key ${key}`)
    await cache.saveCache(
      [IN_PROJECT_VENV_PATH],
      key
    )
  } catch (e) {
    if (e.toString().includes('reserveCache failed')) {
      core.info(e.message)
      return
    }
    throw e
  }
}

export async function restore (
  pythonVersion: string,
  extras: string[]
): Promise<Boolean> {
  const primaryKey = cacheKeyComponents(pythonVersion, extras).join('-')
  const fbKeys: string[] = fallbackKeys(pythonVersion, extras)
  core.info(`restore cache with key ${primaryKey}`)
  core.info(`fallback to ${fbKeys}`)

  return !!(await cache.restoreCache(
    [IN_PROJECT_VENV_PATH],
    primaryKey,
    fbKeys
  ))
}

import * as fs from 'fs'
import * as os from 'os'

import * as cache from '@actions/cache'
import * as core from '@actions/core'
import { ReserveCacheError } from '@actions/cache'

import { hashString } from './utils'
import { IN_PROJECT_VENV_PATH } from './constants'

function cacheKeyComponents (pyVersion: string, extras: string[]): string[] {
  return [
    'poetry',
    'deps',
    '5',
    hashString(os.platform() + os.arch() + os.release()),
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
    core.debug(IN_PROJECT_VENV_PATH)
    await cache.saveCache(
      [IN_PROJECT_VENV_PATH],
      key
    )
  } catch (e) {
    if (e instanceof ReserveCacheError) {
      if (e.toString().includes('another job may be creating this cache')) {
        return
      }
      throw e
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
  core.debug(IN_PROJECT_VENV_PATH)
  const hitKey = await cache.restoreCache(
    [IN_PROJECT_VENV_PATH],
    primaryKey,
    fbKeys
  )
  return hitKey === primaryKey
}

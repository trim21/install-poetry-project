import * as fs from 'fs'
import * as os from 'os'

import * as cache from '@actions/cache'
import * as core from '@actions/core'

import { hashString } from './utils'
import { IN_PROJECT_VENV_PATH } from './constants'

function cacheKeyComponents (
  pyVersion: string,
  extras: string[],
  additionalArgs: string[]
): string[] {
  const keys = [
    'poetry',
    'deps',
    '7',
    hashString(os.platform() + os.arch() + os.release() + pyVersion),
    poetryLockCacheKey()
  ]

  if (extras.length > 0) {
    keys.push(hashString(extras.join('_')))
  }

  if (additionalArgs.length > 0) {
    keys.push(hashString(additionalArgs.join(' ')))
  }

  return keys
}

// fallback to same python version's cache
function fallbackKeys (pyVersion: string, extras: string[], additionalArgs: string[]): string[] {
  const keys = []
  const components = cacheKeyComponents(pyVersion, extras, additionalArgs)
  for (let index = 5; index < components.length; index++) {
    keys.unshift(components.slice(0, index).join('-'))
  }
  return keys
}

function poetryLockCacheKey (): string {
  return hashString(fs.readFileSync('poetry.lock').toString())
}

export async function setup (
  pythonVersion: string,
  extras: string[],
  additionalArgs: string[]
): Promise<void> {
  const key = cacheKeyComponents(pythonVersion, extras, additionalArgs).join('-')
  core.info(`cache with key ${key}`)
  core.debug(IN_PROJECT_VENV_PATH)
  await cache.saveCache(
    [IN_PROJECT_VENV_PATH],
    key
  )
}

export async function restore (
  pythonVersion: string,
  extras: string[],
  additionalArgs: string[]
): Promise<boolean> {
  const primaryKey = cacheKeyComponents(pythonVersion, extras, additionalArgs).join('-')
  const fbKeys: string[] = fallbackKeys(pythonVersion, extras, additionalArgs)
  core.info(`restore cache with key ${primaryKey}`)
  core.info(`fallback to ${fbKeys.toString()}`)
  core.debug(IN_PROJECT_VENV_PATH)
  const hitKey = await cache.restoreCache(
    [IN_PROJECT_VENV_PATH],
    primaryKey,
    fbKeys
  )
  return hitKey === primaryKey
}

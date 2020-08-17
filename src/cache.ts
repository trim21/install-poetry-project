import * as cache from '@actions/cache'
import * as fs from 'fs'
import * as core from '@actions/core'
import { PYTHONUSERBASE } from './constants'
import { hashString } from './utils'

function cacheKey (pyVersion: string, extras: string[]): string {
  const key = `poetry-deps-1-${process.platform}-${hashString(pyVersion)}-${poetryLockCacheKey()}-${hashString(extras.join('_'))}`
  core.info(`cache with key ${key}`)
  return key
}

function poetryLockCacheKey () {
  return hashString(fs.readFileSync('poetry.lock').toString())
}

export async function setup (
  pythonVersion: string,
  extras: string[]
): Promise<void> {
  try {
    await cache.saveCache(
      [PYTHONUSERBASE],
      cacheKey(pythonVersion, extras)
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
  return !!(await cache.restoreCache(
    [PYTHONUSERBASE],
    cacheKey(pythonVersion, extras),
    [cacheKey(pythonVersion, [])]
  ))
}

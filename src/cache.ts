import * as cache from '@actions/cache'
import * as fs from 'fs'
import * as core from '@actions/core'
import { PYTHONUSERBASE } from './constants'
import { hashString } from './utils'

function cacheKey (pyVersion: string, extras: string[]): string {
  return `poetry-deps-1-${process.platform}-${hashString(pyVersion)}-${poetryLockCacheKey()}-${hashString(extras.join('_'))}`
}

function poetryLockCacheKey () {
  return hashString(fs.readFileSync('poetry.lock').toString())
}

export async function setup (
  pythonVersion: string,
  extras: string[]
): Promise<void> {
  try {
    const key = cacheKey(pythonVersion, extras)
    core.info(`cache with key ${key}`)
    await cache.saveCache(
      [PYTHONUSERBASE],
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
  const primaryKey = cacheKey(pythonVersion, extras)
  const fallbackKeys = [cacheKey(pythonVersion, [])]
  core.info(`restore cache with key ${primaryKey}`)
  core.info(`fallback to ${fallbackKeys}`)

  return !!(await cache.restoreCache(
    [PYTHONUSERBASE],
    primaryKey,
    fallbackKeys
  ))
}

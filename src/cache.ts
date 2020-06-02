import * as cache from '@actions/cache'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as core from '@actions/core'
import { PYTHONUSERBASE } from './constants'

function cacheKey (pyVersion: string, extras: string[]): string {
  const md5 = crypto.createHash('md5')
  const result = md5.update(pyVersion).digest('hex')
  const key = `poetry-deps-1-${process.platform}-${result}-${poetryLockCacheKey()}-${extras.join('_')}`
  core.info(`cache with key ${key}`)
  return key
}

function poetryLockCacheKey () {
  const md5 = crypto.createHash('md5')
  return md5.update(fs.readFileSync('poetry.lock').toString()).digest('hex')
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
    cacheKey(pythonVersion, extras)
  ))
}

import { exec } from '@actions/exec'
import crypto from 'crypto'

export async function getPythonVersion (): Promise<string> {
  let myOutput = ''
  const options = {
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        myOutput += data.toString()
      }
    }
  }

  await exec('python', ['-VV'], options)
  return myOutput
}

export function hashString (s: string): string {
  const md5 = crypto.createHash('md5')
  return md5.update(s).digest('hex')
}

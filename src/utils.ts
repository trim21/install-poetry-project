import { exec } from '@actions/exec'

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

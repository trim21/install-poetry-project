import * as pep440 from "@renovatebot/pep440";
import { exec } from "@actions/exec";

export async function config(key: string, value: string): Promise<void> {
  const args = ["config", key, value];

  await exec("poetry", args);
}

export async function install(
  extras: string[],
  additionalArgs: string[],
): Promise<void> {
  const args = ["install"];
  for (const extra of extras) {
    args.push("-E", extra);
  }
  if (additionalArgs.length > 0) {
    args.push(...additionalArgs);
  }

  const poetryVersion = await getVersion();
  if (pep440.gte(poetryVersion, "1.1.0")) {
    if (pep440.gte(poetryVersion, "1.2.0")) {
      if (!args.includes("--sync")) {
        args.push("--sync");
      }
    } else {
      if (!args.includes("--remove-untracked")) {
        args.push("--remove-untracked");
      }
    }
  }

  await exec("poetry", args, {
    env: {
      ...process.env,
      PYTHONIOENCODING: "utf-8",
      PYTHONUNBUFFERED: "1",
    },
  });
}

const pattern = /Poetry \(version (.*)\)/;

export async function getVersion(): Promise<string> {
  let output = "";
  const options = {
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
  };

  await exec("poetry", ["--version"], options);
  const match = pattern.exec(output);
  if (match !== null && match.length >= 1) {
    return match[1];
  }
  return output.replace("Poetry version ", "");
}

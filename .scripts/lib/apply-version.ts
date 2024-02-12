import Glob from "fast-glob";
import { readFileSync, writeFileSync } from "fs";
import Yaml from "yaml";

const SELF_PATH = "IdealSupply/github-workflows";

export function applyVersion(version: string = "main") {
  const ymlFiles = Glob.sync(".github/**/*.{yml,yaml}");
  let modified = false;

  for (const file of ymlFiles) {
    const f = readFileSync(file, "utf8");
    const doc = Yaml.parse(f);

    const jobs = doc.jobs as Record<string, any>;
    if (jobs) {
      for (const job of Object.values(jobs)) {
        const uses = job.uses as string;

        if (uses && uses.startsWith(SELF_PATH)) {
          const versionParts = uses.split("@");
          if (versionParts.length == 2) {
            const verStr = (version === "main" ? "@" : "@v") + version;
            job.uses = versionParts[0] + verStr;
            modified = true;
          }
        }

        const steps = job.steps as Record<string, any>[];

        if (steps) {
          for (const step of steps) {
            if (step.uses && step.uses.startsWith(SELF_PATH)) {
              const versionParts = step.uses.split("@");
              if (versionParts.length == 2) {
                const verStr = (version === "main" ? "@" : "@v") + version;
                step.uses = versionParts[0] + verStr;
                modified = true;
              }
            }
          }
        }
      }
    }

    const runs = doc.runs as Record<string, any>;
    if (runs) {
      for (const run of Object.values(runs)) {
        if (run.uses && run.uses.startsWith(SELF_PATH)) {
          var versionParts = run.uses.split("@");
          if (versionParts.length == 2) {
            const verStr = (version === "main" ? "@" : "@v") + version;
            run.uses = versionParts[0] + verStr;
            modified = true;
          }
        }
      }
    }

    if (modified) {
      writeFileSync(file, Yaml.stringify(doc));
    }
  }
}

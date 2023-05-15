import path from "path"
import { fileURLToPath } from "url"
import * as git from "@changesets/git"

import { getPackages } from "@manypkg/get-packages"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const repoRootDir = path.join(__dirname, "../../")

async function tag() {
  const { packages, tool } = await getPackages(repoRootDir)

  const allExistingTags = await git.getAllTags(repoRootDir)

  const libPackages = packages.filter((p) => {

    const isDocs = p.packageJson.name === "docs"

    return p.packageJson.private != true || isDocs
  })

  console.log("---Tagging---")
  for (const pkg of libPackages) {
    const tag =
      tool !== "root"
        ? `${pkg.packageJson.name}@${pkg.packageJson.version}`
        : `v${pkg.packageJson.version}`

    if (allExistingTags.has(tag)) {
      console.log("Skipping tag (already exists): ", tag)
    } else {
      console.log("New tag: ", tag)
      await git.tag(tag, repoRootDir)
    }
  }
}

tag()

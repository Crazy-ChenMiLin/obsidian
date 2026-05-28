#!/usr/bin/env node
import fs from "fs"
import path from "path"
import YAML from "yaml"
import { installPlugins, parsePluginSource } from "./gitLoader.js"
import type { PluginSource } from "./types"

type PluginEntry = {
  source: PluginSource
  enabled?: boolean
}

type QuartzPluginConfig = {
  externalPlugins?: string[]
  plugins?: PluginEntry[]
}

function resolveConfigPath(): string | null {
  const candidates = [
    "quartz.config.yaml",
    "quartz.config.yml",
    "quartz.plugins.json",
    "quartz.config.default.yaml",
    "quartz.plugins.default.json",
  ]

  for (const candidate of candidates) {
    const fullPath = path.join(process.cwd(), candidate)
    if (fs.existsSync(fullPath)) return fullPath
  }

  return null
}

function readPluginSources(): PluginSource[] {
  const configPath = resolveConfigPath()
  if (!configPath) return []

  const raw = fs.readFileSync(configPath, "utf-8")
  const config = (
    configPath.endsWith(".yaml") || configPath.endsWith(".yml")
      ? YAML.parse(raw)
      : JSON.parse(raw)
  ) as QuartzPluginConfig

  if (config.externalPlugins?.length) {
    return config.externalPlugins
  }

  return (
    config.plugins
      ?.filter((plugin) => plugin.enabled !== false)
      .map((plugin) => plugin.source) ?? []
  )
}

async function main() {
  const externalPlugins = readPluginSources()

  if (externalPlugins.length === 0) {
    console.log("No external plugins to install.")
    return
  }

  console.log(`Installing ${externalPlugins.length} plugin(s) from Git...`)

  const specs = externalPlugins.map((source) => parsePluginSource(source))
  const installed = await installPlugins(specs, { verbose: true })

  if (installed.size === externalPlugins.length) {
    console.log("✓ All plugins installed successfully")
  } else {
    console.error(`✗ Only ${installed.size}/${externalPlugins.length} plugins installed`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("Failed to install plugins:", err)
  process.exit(1)
})

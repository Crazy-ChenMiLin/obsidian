#!/usr/bin/env node
import fs from "fs"
import path from "path"
import YAML from "yaml"

const root = process.cwd()
const contentDir = path.join(root, "content")
const ignoredDirs = new Set([
  ".git",
  ".github",
  ".idea",
  ".obsidian",
  ".quartz",
  "content",
  "node_modules",
  "public",
  "quartz",
])
const attachmentExts = new Set([
  ".avif",
  ".bmp",
  ".canvas",
  ".excalidraw",
  ".gif",
  ".jpeg",
  ".jpg",
  ".m4a",
  ".mp3",
  ".mp4",
  ".ogg",
  ".pdf",
  ".png",
  ".svg",
  ".webm",
  ".webp",
])
const dryRun = process.argv.includes("--dry-run")

function toPosix(filePath) {
  return filePath.split(path.sep).join("/")
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue

    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath, files)
    } else {
      files.push(fullPath)
    }
  }
  return files
}

function frontmatter(markdown) {
  if (!markdown.startsWith("---\n") && !markdown.startsWith("---\r\n")) {
    return {}
  }

  const end = markdown.search(/\r?\n---\r?\n/)
  if (end === -1) return {}

  const raw = markdown.slice(4, end)
  try {
    return YAML.parse(raw) ?? {}
  } catch {
    return {}
  }
}

function isPublished(filePath) {
  const markdown = fs.readFileSync(filePath, "utf-8")
  const fm = frontmatter(markdown)
  return fm.publish === true || fm.quartzPublish === true || fm["quartz-publish"] === true
}

function copyFile(src, dest) {
  if (dryRun) return
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

function cleanContentDir() {
  if (dryRun) return
  fs.rmSync(contentDir, { recursive: true, force: true })
  fs.mkdirSync(contentDir, { recursive: true })
  fs.writeFileSync(path.join(contentDir, ".gitkeep"), "")
}

function stripWikiTarget(target) {
  return target.split("|")[0].split("#")[0].trim()
}

function makeIndexes(files) {
  const byRelative = new Map()
  const byBasename = new Map()

  for (const file of files) {
    const rel = toPosix(path.relative(root, file))
    byRelative.set(rel.toLowerCase(), file)

    const base = path.basename(file).toLowerCase()
    if (!byBasename.has(base)) byBasename.set(base, [])
  }

  for (const file of files) {
    byBasename.get(path.basename(file).toLowerCase())?.push(file)
  }

  return { byRelative, byBasename }
}

function resolveWikiAttachment(target, indexes) {
  const clean = stripWikiTarget(target)
  if (!clean) return null

  const ext = path.extname(clean)
  if (!attachmentExts.has(ext.toLowerCase())) return null

  const normalized = clean.replaceAll("/", path.sep)
  const relHit = indexes.byRelative.get(toPosix(normalized).toLowerCase())
  if (relHit) return relHit

  const hits = indexes.byBasename.get(path.basename(clean).toLowerCase()) ?? []
  return hits.length === 1 ? hits[0] : null
}

function resolveMarkdownAttachment(notePath, target) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("#")) return null

  const clean = decodeURI(target.split("#")[0]).trim()
  if (!clean) return null

  const ext = path.extname(clean)
  if (!attachmentExts.has(ext.toLowerCase())) return null

  const abs = path.resolve(path.dirname(notePath), clean)
  return fs.existsSync(abs) ? abs : null
}

function attachmentReferences(notePath, indexes) {
  const markdown = fs.readFileSync(notePath, "utf-8")
  const refs = new Set()

  for (const match of markdown.matchAll(/!?\[\[([^\]]+)\]\]/g)) {
    const resolved = resolveWikiAttachment(match[1], indexes)
    if (resolved) refs.add(resolved)
  }

  for (const match of markdown.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    const resolved = resolveMarkdownAttachment(notePath, match[1])
    if (resolved) refs.add(resolved)
  }

  return refs
}

const allFiles = walk(root)
const markdownFiles = allFiles.filter((file) => path.extname(file).toLowerCase() === ".md")
const publishedNotes = markdownFiles.filter(isPublished)
const indexes = makeIndexes(allFiles)

if (publishedNotes.length === 0) {
  console.log("No notes with publish: true found. Existing content/ was left unchanged.")
  process.exit(0)
}

console.log(`${dryRun ? "Would sync" : "Syncing"} ${publishedNotes.length} published note(s).`)

cleanContentDir()

const copiedAttachments = new Set()
for (const note of publishedNotes) {
  const rel = path.relative(root, note)
  const dest = path.join(contentDir, rel)
  console.log(`note  ${toPosix(rel)}`)
  copyFile(note, dest)

  for (const attachment of attachmentReferences(note, indexes)) {
    const attachmentRel = path.relative(root, attachment)
    if (copiedAttachments.has(attachmentRel)) continue
    copiedAttachments.add(attachmentRel)

    console.log(`asset ${toPosix(attachmentRel)}`)
    copyFile(attachment, path.join(contentDir, attachmentRel))
  }
}

console.log(
  `${dryRun ? "Dry run complete" : "Done"}: ${publishedNotes.length} note(s), ${copiedAttachments.size} attachment(s).`,
)

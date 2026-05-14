#!/usr/bin/env node

/**
 * Refresh the benchmark tables in README.md from a fresh bench run.
 *
 * Flow:
 *   1. Run `vitest bench --outputJson=.bench-results.json` in each
 *      benchmarked package (core, entropy).
 *   2. Parse the JSON output and extract the `comparative.bench.ts` groups.
 *   3. Build two markdown tables (core multi-library + entropy vs zxcvbn).
 *   4. Replace the content between `<!-- BENCHMARK:START -->` and
 *      `<!-- BENCHMARK:END -->` in README.md.
 *
 * Usage: pnpm bench:update-readme
 *
 * Intentionally opt-in. Plain `pnpm bench` stays read-only so contributors
 * running benchmarks for debugging don't get unintended README diffs.
 *
 * Implementation note: subprocess invocations use `execFileSync` (no shell)
 * with static literal arguments — no user input is interpolated into a
 * command line, so there's no injection surface here.
 */

const { execFileSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const REPO_ROOT = path.resolve(__dirname, '..')
const README = path.join(REPO_ROOT, 'README.md')

const START_MARKER = '<!-- BENCHMARK:START -->'
const END_MARKER = '<!-- BENCHMARK:END -->'

const PACKAGE_NAMES = ['@sentinel-password/core', '@sentinel-password/entropy']

// Static, literal absolute paths — no dynamic path construction.
const CORE_BENCH_OUTPUT = `${REPO_ROOT}/packages/core/.bench-results.json`
const ENTROPY_BENCH_OUTPUT = `${REPO_ROOT}/packages/entropy/.bench-results.json`

// --- Step 1: Run benchmarks ------------------------------------------------

function runBenchmarks() {
  for (const pkgName of PACKAGE_NAMES) {
    console.log(`\n▶︎ Running ${pkgName} benchmarks (this takes ~30s)...`)
    execFileSync(
      'pnpm',
      ['--filter', pkgName, 'exec', 'vitest', 'bench', '--outputJson=.bench-results.json', '--run'],
      { stdio: 'inherit', cwd: REPO_ROOT }
    )
  }
}

// --- Step 2: Parse + extract comparative groups ----------------------------

/**
 * Returns:
 *   {
 *     'Weak password — "password"': { 'sentinel-password': 119000, zxcvbn: 21500, ... },
 *     ...
 *   }
 */
function extractComparative(data) {
  const result = {}
  for (const file of data.files) {
    if (!file.filepath.includes('comparative.bench.ts')) continue
    for (const group of file.groups) {
      const fixture = group.fullName.split(' > ').slice(1).join(' > ')
      result[fixture] = {}
      for (const bench of group.benchmarks) {
        result[fixture][bench.name] = bench.hz
      }
    }
  }
  return result
}

// --- Step 3: Format helpers -------------------------------------------------

function formatOps(hz) {
  let rounded
  if (hz >= 10_000) rounded = Math.round(hz / 1000) * 1000
  else if (hz >= 100) rounded = Math.round(hz / 100) * 100
  else if (hz >= 1) rounded = Math.round(hz)
  else rounded = Number(hz.toFixed(1))
  return rounded.toLocaleString('en-US')
}

function formatSpeedup(ratio) {
  if (ratio >= 100) return `**${Math.round(ratio).toLocaleString('en-US')}×**`
  if (ratio >= 10) return `**${Math.round(ratio)}×**`
  return `**${ratio.toFixed(1)}×**`
}

const FIXTURE_LABELS = {
  'Weak password — "password"': 'Weak (`"password"`)',
  'Medium password — "MyPassword1"': 'Medium (`"MyPassword1"`)',
  'Strong password — "MyP@ssw0rd123!"': 'Strong (`"MyP@ssw0rd123!"`)',
  'Long password (200+ chars)': 'Long (200+ chars)',
  'Batch validation — 100 passwords': 'Batch (100 passwords)',
  'Batch estimation — 100 passwords': 'Batch (100 passwords)',
}

const FIXTURE_ORDER = [
  'Weak password — "password"',
  'Medium password — "MyPassword1"',
  'Strong password — "MyP@ssw0rd123!"',
  'Long password (200+ chars)',
  // Batch entries come last; core's says "validation", entropy's says "estimation".
]

function labelFor(fixture) {
  return FIXTURE_LABELS[fixture] || fixture
}

function unitForFixture(fixture) {
  return fixture.startsWith('Batch') ? 'batches/s' : 'ops/s'
}

// --- Step 4: Build the markdown tables --------------------------------------

function buildCoreTable(comparative) {
  const fixtures = [...FIXTURE_ORDER, 'Batch validation — 100 passwords'].filter(
    (f) => comparative[f]
  )
  const lines = []
  lines.push('### Password validation (`@sentinel-password/core`)')
  lines.push('')
  lines.push(
    '| Password | sentinel-password | zxcvbn | check-password-strength | password-validator |'
  )
  lines.push('|---|---|---|---|---|')
  for (const fixture of fixtures) {
    const row = comparative[fixture]
    const unit = unitForFixture(fixture)
    lines.push(
      `| ${labelFor(fixture)} ` +
        `| **${formatOps(row['sentinel-password'])} ${unit}** ` +
        `| ${formatOps(row['zxcvbn'])} ${unit} ` +
        `| ${formatOps(row['check-password-strength'])} ${unit} ` +
        `| ${formatOps(row['password-validator'])} ${unit} |`
    )
  }
  return lines.join('\n')
}

function buildEntropyTable(comparative) {
  const fixtures = [...FIXTURE_ORDER, 'Batch estimation — 100 passwords'].filter(
    (f) => comparative[f]
  )
  const lines = []
  lines.push('### Entropy estimation (`@sentinel-password/entropy`)')
  lines.push('')
  lines.push('| Password | sentinel-entropy | zxcvbn | Speedup |')
  lines.push('|---|---|---|---|')
  for (const fixture of fixtures) {
    const row = comparative[fixture]
    const unit = unitForFixture(fixture)
    const speedup = row['sentinel-entropy'] / row['zxcvbn']
    lines.push(
      `| ${labelFor(fixture)} ` +
        `| **${formatOps(row['sentinel-entropy'])} ${unit}** ` +
        `| ${formatOps(row['zxcvbn'])} ${unit} ` +
        `| ${formatSpeedup(speedup)} |`
    )
  }
  return lines.join('\n')
}

function buildFooter() {
  const cpu = (() => {
    try {
      return execFileSync('sysctl', ['-n', 'machdep.cpu.brand_string'], {
        encoding: 'utf-8',
      }).trim()
    } catch {
      return `${os.cpus()[0]?.model ?? 'unknown CPU'}`
    }
  })()
  const nodeVer = process.version
  const platform = `${os.platform()} ${os.arch()}`
  return (
    `_Refreshed via \`pnpm bench:update-readme\` on ${cpu}, Node ${nodeVer}, ${platform}._  ` +
    '\n' +
    '_Ops/sec varies 30-50 % across hardware. See [Performance docs](https://akankov.github.io/sentinel-password/guide/performance) for run methodology + per-fixture latency tables._'
  )
}

// --- Step 5: Splice into README ---------------------------------------------

function spliceIntoReadme(coreTable, entropyTable, footer) {
  const readme = fs.readFileSync(README, 'utf-8')
  const startIdx = readme.indexOf(START_MARKER)
  const endIdx = readme.indexOf(END_MARKER)
  if (startIdx === -1 || endIdx === -1) {
    console.error(
      `ERROR: Could not find marker comments in README.md.\n` +
        `Expected: "${START_MARKER}" and "${END_MARKER}"`
    )
    process.exit(1)
  }
  const before = readme.substring(0, startIdx + START_MARKER.length)
  const after = readme.substring(endIdx)
  const body = `\n\n${coreTable}\n\n${entropyTable}\n\n${footer}\n\n`
  fs.writeFileSync(README, before + body + after, 'utf-8')
}

// --- Main -------------------------------------------------------------------

function main() {
  runBenchmarks()

  const coreData = JSON.parse(fs.readFileSync(CORE_BENCH_OUTPUT, 'utf-8'))
  const entropyData = JSON.parse(fs.readFileSync(ENTROPY_BENCH_OUTPUT, 'utf-8'))

  const coreComparative = extractComparative(coreData)
  const entropyComparative = extractComparative(entropyData)

  const coreTable = buildCoreTable(coreComparative)
  const entropyTable = buildEntropyTable(entropyComparative)
  const footer = buildFooter()

  spliceIntoReadme(coreTable, entropyTable, footer)
  console.log(`\n✓ Updated benchmark tables in ${README}`)
}

main()

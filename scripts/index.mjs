import { execSync } from 'child_process'
import fs from 'fs'

// Global variables
const outputFilePath = './coverage_data/db.json'
const branch_name = getCurrentBranchName()
const db = JSON.parse(fs.readFileSync(outputFilePath, 'utf8'))

// Global functions
function getCurrentBranchName() {
  try {
    const branchName = execSync('git rev-parse --abbrev-ref HEAD')
      .toString()
      .trim()
    return branchName
  } catch (error) {
    console.error(`Error getting current branch name: ${error.message}`)
    return null
  }
}

function writeDB(coverages) {
  const allowed = ['main', 'dev', 'staging']
  db[branch_name] = coverages

  if (allowed.includes(branch_name)) {
    fs.writeFileSync(outputFilePath, JSON.stringify(db, null, 2))
  }
}

class Coverage {
  project_name = ''
  isPackage = false // By default will find in Apps
  averages = {}
  total_average = 0

  constructor(project_name) {
    this.project_name = project_name
  }

  async filePath() {
    const appPath = `./apps/${this.project_name}/coverage/coverage-summary.json`
    const packagePath = `./packages/${this.project_name}/coverage/coverage-summary.json`

    if (await this.fileExists(appPath)) {
      return appPath
    } else if (await this.fileExists(packagePath)) {
      this.isPackage = true
      return packagePath
    } else {
      return null
    }
  }

  fileExists(filePath) {
    return new Promise((resolve) => {
      fs.access(filePath, fs.constants.F_OK, (err) => {
        resolve(!err)
      })
    })
  }

  async calculateAverageCoverage() {
    try {
      const filePath = await this.filePath()
      const summary = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      const coverageTypes = ['lines', 'branches', 'functions', 'statements']
      const averages = {}

      for (const type of coverageTypes) {
        if (!summary.total[type]) {
          averages[type] = 0
          continue
        }

        const totalFiles = Object.keys(summary.total[type]).length
        let totalCoverage = 0

        for (const file in summary.total[type]) {
          totalCoverage += summary.total[type].pct
        }

        const averageCoverage = totalCoverage / totalFiles
        this.total_average += averageCoverage
        averages[type] = averageCoverage
      }

      this.averages = averages
      this.total_average = Number(
        (this.total_average / coverageTypes.length).toFixed(2)
      )
    } catch {
      console.error(`Error getting coverage for ${this.project_name}`)
    }

    return this
  }
}

async function getCurrentBranchCoverage() {
  const coverages = [
    new Coverage('saas'),
    new Coverage('marketplace'),
    new Coverage('store'),
    new Coverage('flecto-link'),
    new Coverage('flecto-ui'),
    new Coverage('shared-ui-modules'),
  ]

  const requestsCoverage = coverages.map((coverage) =>
    coverage.calculateAverageCoverage()
  )

  const coveragesAverages = await Promise.all(requestsCoverage)

  return coveragesAverages
}

async function checkArg(branch = 'dev') {
  const currentBranch = await getCurrentBranchCoverage()
  const branchToCompareWith = db[branch]
  const projectLowerCoverage = []

  for (const coverage of currentBranch) {
    const coverageToCompare = branchToCompareWith.find(
      (currentBranch) => currentBranch.project_name === coverage.project_name
    )

    if (coverageToCompare.total_average > coverage.total_average) {
      projectLowerCoverage.push({
        project_name: coverageToCompare.project_name,
        current_coverage: coverage.total_average,
        actual_coverage: coverageToCompare.total_average,
      })
    }
  }

  if (projectLowerCoverage.length > 0) {
    console.table(projectLowerCoverage)
    process.exit(1)
  }
}

async function printAllDiff(branch = 'dev') {
  const currentBranch = await getCurrentBranchCoverage()
  const branchToCompareWith = db[branch]
  const projectLowerCoverage = []

  for (const coverage of currentBranch) {
    const coverageToCompare = branchToCompareWith.find(
      (currentBranch) => currentBranch.project_name === coverage.project_name
    )

    projectLowerCoverage.push({
      project_name: coverageToCompare.project_name,
      current_coverage: coverage.total_average,
      actual_coverage: coverageToCompare.total_average,
    })
  }

  if (projectLowerCoverage.length > 0) {
    console.table(projectLowerCoverage)
  }
}

async function writeArg() {
  const coveragesAverages = await getCurrentBranchCoverage()
  writeDB(coveragesAverages)
}

function readArg() {
  const dbTable = [
    [
      'Project',
      'Lines',
      'Branches',
      'Functions',
      'Statements',
      'total_average',
    ],
    ...db['dev'].map((coverage) => {
      return [
        coverage.project_name,
        coverage.averages.lines,
        coverage.averages.branches,
        coverage.averages.functions,
        coverage.averages.statements,
        coverage.total_average,
      ]
    }),
  ]
  console.table(dbTable)
}

switch (process.argv.at(-1)) {
  case '--check':
    await checkArg('dev')
    break
  case '--write':
    await writeArg()
    break
  case '--read':
    readArg()
    break
  case '--diff':
    printAllDiff()
    break
  default:
    console.log('No option')
}

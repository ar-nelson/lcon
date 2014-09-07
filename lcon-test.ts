/// <reference path="typings/node.d.ts" />
/// <reference path="typings/underscore.d.ts" />
/// <reference path="typings/chalk.d.ts" />
/// <reference path="lcon.ts" />
import LCON    = require('./lcon')
import _       = require('underscore')
import fs      = require('fs')
import chalk   = require('chalk')
var formatJson = require('format-json')
var figures    = require('figures')

var testDir: string = "./test"

function exit(code: number): void {
  console.log("")
  process.exit(code)
}

function errorMsg(file: string, error: any): void {
  console.log(" " +
    chalk.bold.yellow(figures.warning) + "  " +
    chalk.bold(file) + " failed with error:"
  )
  if (error.stack) console.error(error.stack)
  else console.error(error)
}

console.log("")
console.log(chalk.bold("LCON Test Suite"))
console.log(chalk.bold("---------------"))
console.log("")
if (!fs.existsSync(testDir)) {
  console.error("Required directory " + testDir + " does not exist.")
  exit(2)
}
var srcDir      = testDir + "/src",
    expectedDir = testDir + "/expected",
    outDir      = testDir + "/out";
if (fs.existsSync(outDir)) {
  _(fs.readdirSync(outDir)).forEach(f => fs.unlinkSync(outDir + "/" + f))
  fs.rmdirSync(outDir)
}
fs.readdir(srcDir, (err, files) => {
  if (err) {
    console.error(err); exit(2)
  } else {
    files = _(files).filter(s => s && /^.*\.lcon$/i.test(s)).sort().reverse()
    var passed = 0, failed = 0, errored = 0
    function next(): void {
      if (files.length > 0) {
        var file = files.pop()
        function errorResult(err: any): void {
          ++errored
          errorMsg(file, err)
          next()
        }
        fs.readFile(srcDir + "/" + file, {}, (err, data) => {
          if (err) { errorResult(err) } else {
            try {
              var srcDataUnordered = LCON.parseUnordered(data.toString())
              var srcDataOrdered   = LCON.parseOrdered(data.toString())
              var jsonFile = file.substring(0, file.length - 5) + ".json"
              fs.readFile(expectedDir + "/" + jsonFile, {}, (err, data) => {
                if (err) { errorResult(err) } else {
                  try {
                    var expectedData = JSON.parse(data.toString())
                    if (_.isEqual(srcDataUnordered, expectedData)) {
                      ++passed
                      console.log(" " +
                        chalk.bold.green(figures.tick) + "  " +
                        chalk.bold(file) + " passed"
                      )
                    } else {
                      ++failed
                      console.log(" " +
                        chalk.bold.red(figures.cross) + "  " +
                        chalk.bold(file) + " failed;\n    compare " +
                        chalk.bold.red(outDir + "/" + jsonFile) + "\n    to " +
                        chalk.bold.cyan(expectedDir + "/" + jsonFile)
                      )
                      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)
                      fs.writeFileSync(
                        outDir + "/" + jsonFile,
                        formatJson.plain(srcDataUnordered)
                      )
                    }

                    try {
                      if (!_.isEqual(
                        srcDataUnordered,
                        LCON.parseUnordered(LCON.stringifyUnordered(srcDataUnordered)))
                      ) {
                        console.log(" " +
                          chalk.bold.red(figures.cross) + "  " +
                          chalk.bold(file) + " failed unordered stringify test.")
                      }
                    } catch (err) {
                      errorResult("Error in unordered stringify test: " + err)
                    }

                    try {
                      if (!_.isEqual(
                        srcDataOrdered,
                        LCON.parseOrdered(LCON.stringifyOrdered(srcDataOrdered)))
                      ) {
                        console.log(" " +
                          chalk.bold.red(figures.cross) + "  " +
                          chalk.bold(file) + " failed ordered stringify test.")
                      }
                    } catch (err) {
                      errorResult("Error in ordered stringify test: " + err)
                    }

                    next()
                  } catch (err) { errorResult(err) }
                }
              })
            } catch (err) { errorResult(err) }
          }
        })
      } else {
        console.log("")
        console.log("Result: " +
          chalk.bold.green(passed.toString())  + " passed, " +
          chalk.bold.red(failed.toString()) + " failed, " +
          chalk.bold.yellow(errored.toString())   + " errored."
        )
        exit((failed > 0 || errored > 0) ? 1 : 0)
      }
    }
    next()
  }
})

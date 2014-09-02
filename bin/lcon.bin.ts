/// <reference path="../typings/node.d.ts" />
/// <reference path="../typings/nomnom.d.ts" />
/// <reference path="../typings/underscore.d.ts" />
/// <reference path="../typings/chalk.d.ts" />
/// <reference path="../lcon.ts" />
import LCON   = require('../lcon')
import nomnom = require('nomnom')
import _      = require('underscore')
import fs     = require('fs')
import chalk  = require("chalk")
var figures    = require("figures")
var formatJson = require('format-json')

if (process.argv.length <= 2) {
  // Print a help message if there are no arguments.
  process.argv.push("--help")
}

var opts = nomnom.script("lcon").options({
  stdout: {
    abbr: 's',
    full: 'stdout',
    flag: true,
    help: 'Parse to stdout instead of a new file.'
  },
  prettyPrint: {
    abbr: 'p',
    full: 'pretty-print',
    flag: true,
    help: 'Pretty-print JSON, with proper indentation.'
  },
  ordered: {
    abbr: 'o',
    full: 'ordered',
    flag: true,
    help: 'Output an ordered JSON format which contains only arrays, no objects.' +
          ' First element of each array is (true, false) if it represents an (array, object).'
  }
}).parse()
var files: string[] = opts._

function parse(data: string): string {
  var json = opts.ordered ? LCON.parseOrdered(data) : LCON.parseUnordered(data)
  if (opts.prettyPrint) return formatJson.plain(json)
  else return formatJson.terse(json)
}

function jsonifyFilename(filename: string): string {
  var lconMatch = filename.match(/^(.+)[.]lcon$/i)
  if (lconMatch) return lconMatch[1] + ".json"
  else return filename + ".json"
}

function logFailure(filename: string, error: any): void {
  console.error(chalk.bold(" " +
    chalk.red(figures.cross) + "  Failed to convert " + filename + ":"
  ))
  console.error()
  console.error(error)
  console.error()
}

function logSuccess(original: string, converted: string): void {
  console.log(chalk.bold(" " +
    chalk.green(figures.tick) + "  Converted " + original + " -> " + converted
  ))
}

if (opts.stdout) {
  if (files.length > 1) {
    console.error("Only one LCON file may be parsed to stdout at a time.")
  } else fs.readFile(files[0], {}, (error, data) => {
    if (error) logFailure(files[0], error)
    else {
      try { console.log(parse(data.toString())) }
      catch (err) { logFailure(files[0], err) }
    }
  })
} else {
  _.forEach(files, (file) => fs.readFile(file, {}, (error, data) => {
    if (error) logFailure(file, error)
    else try {
      var jsonified = jsonifyFilename(file)
      fs.writeFile(jsonified, parse(data.toString()), (error) => {
        if (error) logFailure(file, error)
        else logSuccess(file, jsonified)
      })
    } catch (err) { logFailure(file, err) }
  }))
}

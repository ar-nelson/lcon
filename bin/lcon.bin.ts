/// <reference path="../typings/node.d.ts" />
/// <reference path="../typings/nomnom.d.ts" />
/// <reference path="../typings/underscore.d.ts" />
/// <reference path="../typings/chalk.d.ts" />
/// <reference path="../lcon.ts" />
import LCON   = require('../lcon')
import lexer  = require('../lcon-lexer')
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
  keepOrder: {
    abbr: 'k',
    full: 'keep-order',
    flag: true,
    help: 'Preserve key order in JSON output.'
  },
  ordered: {
    abbr: 'o',
    full: 'ordered',
    flag: true,
    help: 'Output an ordered JSON format which contains only arrays, no objects.' +
          ' First element of each array is (true, false) if it represents an (array, object).'
  },
  lexerMode: {
    full: 'lexer',
    flag: true,
    help: 'Debug mode that prints lexer tokens to stdout. When this option is set, other options' +
          ' are ignored.'
  },
  rewriteMode: {
    full: 'rewrite',
    flag: true,
    help: 'Debug mode that rewrites LCON data in standard format to stdout. When this option is' +
          ' set, other options (except -k/--keep-order) are ignored.'
  }
}).parse()

if (opts.keepOrder && opts.ordered) {
  console.error("Only one of `--keep-order` and `--ordered` may be used at a time.")
  process.exit(3)
}

if (opts.lexerMode && opts.rewriteMode) {
  console.error("Only one of `--lexer` and `--rewrite` may be used at a time.")
  process.exit(3)
}

var files: string[] = opts._

function parse(data: string): string {
  var json = (opts.ordered || opts.keepOrder) ? LCON.parseOrdered(data) : LCON.parseUnordered(data)
  if (opts.prettyPrint) {
    if (opts.keepOrder) return LCON.stringifyOrderedJSON(json, 2)
    else return formatJson.plain(json)
  } else {
    if (opts.keepOrder) return LCON.stringifyOrderedJSON(json)
    else return formatJson.terse(json)
  }
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
  if (error.stack) console.log(error.stack)
  else console.log(error)
  console.error()
}

function logSuccess(original: string, converted: string): void {
  console.log(chalk.bold(" " +
    chalk.green(figures.tick) + "  Converted " + original + " -> " + converted
  ))
}

if (opts.stdout || opts.lexerMode || opts.rewriteMode) {
  if (files.length > 1) {
    console.error("Only one LCON file may be parsed to stdout at a time.")
  } else fs.readFile(files[0], {}, (error, data) => {
    if (error) logFailure(files[0], error)
    else {
      try {
        if (opts.lexerMode) {
          console.log("")
          _(new lexer.Lexer().tokenize(data.toString())).forEach(t => console.log(
            lexer.TokenType[t.type] +
            chalk.cyan(" <") +
            chalk.green(t.value) +
            chalk.cyan("> ") +
            chalk.gray("(line " + t.start.line + ", column " + t.start.column + ")")))
        } else if (opts.rewriteMode) {
          if (opts.keepOrder) {
            console.log(LCON.stringifyOrdered(LCON.parseOrdered(data.toString())))
          } else {
            console.log(LCON.stringifyUnordered(LCON.parseUnordered(data.toString())))
          }
       } else console.log(parse(data.toString()))
      } catch (err) { logFailure(files[0], err) }
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

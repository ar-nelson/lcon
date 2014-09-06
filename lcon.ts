/// <reference path="typings/underscore.d.ts" />
import parser      = require("./lcon-parser")
import lexer       = require("./lcon-lexer")
import orderedJson = require("./ordered-json")
import _           = require("underscore")

export var orderedToUnordered = orderedJson.orderedToUnordered

export var parseOrdered = parser.parse

export function parseUnordered(data: string): any {
  return orderedToUnordered(parseOrdered(data))
}

function isLegalWithoutQuotes(str: string): boolean {
  if (str == "true" || str == "false" || str == "null" || str == "-") return false
  var match = lexer.Lexer.UNQUOTED_STRING.exec(str)
  if (match && match[0].length === str.length) {
    match = lexer.Lexer.NUMBER.exec(str)
    return !match || match[0].length !== str.length
  } else return false
}

export function stringifyUnordered(data: any): string {
  // There's a lot of repetition here that could have been refactored out into
  // subroutines, but deeply-nested data could easily cause this recursive
  // function to overflow the stack. Adding subroutines would only make the
  // problem worse.
  var output: string, first: boolean = true, i: number
  if (_.isArray(data)) {
    output = "["
    for (i = 0; i < data.length; i++) {
      if (first) first = false
      else output += ", "
      output += stringifyUnordered(data[i])
    }
    return output + "]"
  } else if (_.isObject(data)) {
    var keys = _.keys(data)
    if (keys.length === 1) {
      return stringifyUnordered(keys[0]) + " " + stringifyUnordered(data[keys[0]])
    } else {
       // I could have used _.foldl, but, once again, stack space...
       output = "("
      for (i = 0; i < keys.length; i++) {
         if (first) first = false
        else output += ", "
        output += stringifyUnordered(keys[i]) + " " + stringifyUnordered(data[keys[i]])
      }
      return output + ")"
    }
  } else if (_.isString(data)) {
    if (isLegalWithoutQuotes(<string>data)) return <string>data
    else return JSON.stringify(data)
  } else if (_.isNumber(data) || _.isBoolean(data) || _.isNull(data)) {
    return JSON.stringify(data)
  } else {
    throw new TypeError("Cannot stringify: object contains non-JSON data (such as functions).")
  }
}

export function stringifyOrdered(data: any): string {
  var output: string, first: boolean = true, i: number
  if (_.isArray(data) && data.length > 0) {
    output = (data[0] ? "[" : "(")
    if (data[0]) for (i = 1; i < data.length; i++) {
      if (first) first = false
      else output += ", "
      output += stringifyOrdered(data[i])
    } else if (data.length === 3) {
      return stringifyOrdered(data[1]) + " " + stringifyOrdered(data[2])
    } else for (i = 1; i < data.length; i += 2) {
      if (first) first = false
      else output += ", "
      output += stringifyOrdered(data[i]) + " " + stringifyOrdered(data[i + 1])
    }
    return output + (data[0] ? "]" : ")")
  } else if (_.isString(data)) {
    if (isLegalWithoutQuotes(<string>data)) return <string>data
    else return JSON.stringify(data)
  } else if (_.isNumber(data) || _.isBoolean(data) || _.isNull(data)) {
    return JSON.stringify(data)
  } else {
    throw new TypeError(
      "Cannot stringify: object contains non-ordered-JSON data (such as objects or functions).")
  }
}

export function stringifyOrderedJSON(data: any, indent?: number, indentStep?: number): string {
  if (!indent) indent = 0
  if (!indentStep) indentStep = indent
  var output: string, first: boolean = true, i: number, j: number
  if (_.isArray(data) && data.length > 0) {
    output = (data[0] ? "[" : "{") + (indent > 0 && data.length > 1 ? "\n" : "")
    if (data[0]) {
      for (i = 1; i < data.length; i++) {
        if (first) first = false
        else output += (indent > 0 ? ",\n" : ",")
        for (j = 0; j < indent; j++) output += " "
        output += stringifyOrderedJSON(data[i], indent + indentStep, indentStep)
      }
    } else {
      for (i = 1; i < data.length; i += 2) {
        if (first) first = false
        else output += (indent > 0 ? ",\n" : ",")
        for (j = 0; j < indent; j++) output += " "
        output += JSON.stringify(data[i]) + ": " +
          stringifyOrderedJSON(data[i + 1], indent + indentStep, indentStep)
      }
    }
    if (indent > 0 && data.length > 1) {
      output += "\n"
      for (j = 0; j < indent - indentStep; j++) output += " "
    }
    return output + (data[0] ? "]" : "}")
  } else if (_.isString(data) || _.isNumber(data) || _.isBoolean(data) || _.isNull(data)) {
    return JSON.stringify(data)
  } else {
    throw new TypeError(
      "Cannot stringify: object contains non-ordered-JSON data (such as objects or functions).")
  }
}

/// <reference path="lcon-parser.ts" />
/// <reference path="ordered-json.ts" />
import parser      = require("./lcon-parser")
import orderedJson = require("./ordered-json")

/**
 * Converts ordered JSON data to normal (unordered) JSON data. Note that
 * "JSON", in this case, refers to actual JavaScript objects and arrays, not to
 * a JSON string.
 *
 * Ordered JSON is a special JSON format that includes only arrays, no objects.
 * Key order is significant, and, in order to preserve it, objects are
 * represented by arrays in the format `[false, key, value, key, value, ...]`.
 * Actual arrays start with `true`, in order to differentiate them from
 * objects.
 */
export var orderedToUnordered = orderedJson.orderedToUnordered

/**
 * Parses an LCON string into Ordered JSON data.
 *
 * Ordered JSON is a special JSON format that includes only arrays, no objects.
 * Key order is significant, and, in order to preserve it, objects are
 * represented by arrays in the format `[false, key, value, key, value, ...]`.
 * Actual arrays start with `true`, in order to differentiate them from
 * objects.
 */
export var parseOrdered = parser.parse

/**
 * Parses an LCON string into standard JavaScript data types (JSON). This is
 * the LCON equivalent of `JSON.parse`.
 *
 * Key order will usually be preserved, but this is
 * JavaScript-implementation-dependent and not guaranteed. If key order is
 * significant, use `parseOrdered` instead.
 */
export function parseUnordered(data: string): any {
  return orderedToUnordered(parseOrdered(data))
}

// TODO: Stringify functions

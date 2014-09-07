declare module "lcon" {

  export interface SourceLocation {
    line: number
    column: number
  }

  export interface SyntaxTreeBuilder<A> {
    initObject(start: SourceLocation): A
    initArray(start: SourceLocation): A
    appendKeyToObject(key: string, object: A, start: SourceLocation, end: SourceLocation): void
    appendValueToArray(value: any, array: A): void
    appendValueToObject(value: any, object: A): void
    closeObject(object: A, end: SourceLocation): void
    closeArray(array: A, end: SourceLocation): void
    lastElementOfArray(array: A): any
    isObject(thing: any): boolean
    processString(value: string, start: SourceLocation, end: SourceLocation): any
    processNumber(value: number, start: SourceLocation, end: SourceLocation): any
    processBoolean(value: boolean, start: SourceLocation, end: SourceLocation): any
    processNull(start: SourceLocation, end: SourceLocation): any
  }

  export function parseWithBuilder<A>(src: string, builder: SyntaxTreeBuilder<A>): any

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
  export function orderedToUnordered(ordered: any): any

  /**
   * Parses an LCON string into Ordered JSON data.
   *
   * Ordered JSON is a special JSON format that includes only arrays, no objects.
   * Key order is significant, and, in order to preserve it, objects are
   * represented by arrays in the format `[false, key, value, key, value, ...]`.
   * Actual arrays start with `true`, in order to differentiate them from
   * objects.
   */
  export function parseOrdered(src: string): any

  /**
   * Parses an LCON string into standard JavaScript data types (JSON). This is
   * the LCON equivalent of `JSON.parse`.
   *
   * Key order will usually be preserved, but this is
   * JavaScript-implementation-dependent and not guaranteed. If key order is
   * significant, use `parseOrdered` instead.
   */
  export function parseUnordered(src: string): any

  /**
   * Generates a compact LCON string from standard JavaScript data types (JSON).
   * This is the LCON equivalent of `JSON.stringify`.
   *
   * Key order will usually be preserved, but this is
   * JavaScript-implementation-dependent and not guaranteed. If key order is
   * significant, use `stringifyOrdered` instead.
   */
  export function stringifyUnordered(data: any): string

  /**
   * Generates a compact LCON string from Ordered JSON data. Ordered JSON is the
   * data format output by `parseOrdered`; see that function's documentation for
   * more information.
   */
  export function stringifyOrdered(data: any): string

  /**
   * Generates a JSON string (which is also valid LCON) from Ordered JSON data.
   * Ordered JSON is the data format output by `parseOrdered`; see that
   * function's documentation for more information.
   *
   * A second argument, an integer, may be provided; this specifies the size of
   * indents to insert into the output. If the indent size is greater than 0, the
   * output will be pretty-printed with newlines and indentation.
   */
  export function stringifyOrderedJSON(data: any, indent?: number, indentStep?: number): string
}

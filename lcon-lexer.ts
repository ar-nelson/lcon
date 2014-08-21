/// <reference path="typings/underscore.d.ts" />
import _ = require('underscore')

export enum TokenType {
  True, False, Null, Number, String,
  Colon, Comma, Bullet, Newline,
  OpeningParen, ClosingParen, OpeningBracket, ClosingBracket, OpeningBrace, ClosingBrace,
  Indent, Outdent
}

export interface Token {
  type: TokenType
  value: string
  start: SourceLocation
  end: SourceLocation
}

interface ResultAndLength {
  result: string
  length: number
}

export interface SourceLocation {
  line: number
  column: number
}

export class Lexer {

  static NEWLINE = /^((?:\s|;[^\n]*)*)\n([^\S\n]*[.][^\S\n]+|[^\S\n]*[.](?=[\s(\[{;'"`])|[^\S\n]*)/
  static BLOCK_NEWLINE = /^\n([^\S\n]*)([^\n]*)/
  static WHITESPACE = /^[^\S\n]+/
  static LINE_COMMENT = /^\s*;[^\n]*/
  static BLOCK_COMMENT = /^;[:][^\n]*/
  static UNQUOTED_STRING = /^[^\s()\[\]{},;:'"`]+/
  static BLOCK_STRING = /^``[^\S\n]*([^\n]*)/
  static OPEN_PAREN = /^[(](?:\s*\n([^\S\n]*)|\s*)/
  static CLOSE_PAREN = /^\s*[)]/
  static OPEN_BRACKET = /^[\[](?:\s*\n([^\S\n]*)|\s*)/
  static CLOSE_BRACKET = /^\s*[\]]/
  static OPEN_BRACE = /^[{](?:\s*\n([^\S\n]*)|\s*)/
  static CLOSE_BRACE = /^\s*[}]/
  static COMMA = /^\s*[,](?:\s*\n([^\S\n]*)|\s*)/
  static COLON = /^\s*[:]\s*/
  static NUMBER = /^0b[01]+|^0o[0-7]+|^0x[\da-f]+|^\d*\.?\d+(?:e[+-]?\d+)?/i


  private ends: TokenType[]
  private tokens: Token[]
  private indents: number[][]
  private chunk: string
  private chunkLocation: SourceLocation

  tokenize(code: string, opts?: Object): Token[] {
    opts = opts || {}
    while (code.indexOf("\r") > -1) code = code.replace("\r", "")
    code = "\n" + code
    var i: number,
      consumed: number,
      tag: TokenType

    this.ends = []
    this.tokens = []
    this.indents = [[0]]
    this.chunkLocation = {
      line: opts['line'] || 0,
      column: opts['column'] || 0
    }

    i = 0
    while (this.chunk = code.substr(i)) {
      consumed =
      this.stringToken() ||
      this.numberToken() ||
      this.keywordToken() ||
      this.symbolToken() ||
      this.whitespaceToken() ||
      this.commentToken() || // FIXME: Comments may be broken w.r.t. sequential commented lines and indentation
      this.lineToken() ||
      -1

      if (consumed < 0) this.error("Unexpected " + this.chunk.charAt(0))
      this.chunkLocation = this.getLocationFromChunk(consumed)
      i += consumed
    }

    if (tag = this.ends.pop()) this.error("Missing " + TokenType[tag])
    while (this.tokens.length > 0 && this.tokens[0].type == TokenType.Newline) {
      this.tokens = this.tokens.slice(1)
    }
    while (this.tokens.length > 0 && _(this.tokens).last().type == TokenType.Newline) {
      this.tokens.pop()
    }
    while (this.indents[0].length > 1) {
      this.token(TokenType.Outdent, this.indents[0].pop().toString(), 0, 0)
    }
    return this.tokens
  }

  private symbolToken(): number {
    var match: RegExpExecArray
    if (match = Lexer.OPEN_PAREN.exec(this.chunk)) {
      this.token(TokenType.OpeningParen, "(", 0, match[0].length)
      this.pushRegion(TokenType.ClosingParen, match[1] ? match[1].length : 0)
    } else if (match = Lexer.CLOSE_PAREN.exec(this.chunk)) {
      this.token(TokenType.ClosingParen, ")", 0, match[0].length)
    } else if (match = Lexer.OPEN_BRACKET.exec(this.chunk)) {
      this.token(TokenType.OpeningBracket, "[", 0, match[0].length)
      this.pushRegion(TokenType.ClosingBracket, match[1] ? match[1].length : 0)
    } else if (match = Lexer.CLOSE_BRACKET.exec(this.chunk)) {
      this.token(TokenType.ClosingBracket, "]", 0, match[0].length)
    } else if (match = Lexer.OPEN_BRACE.exec(this.chunk)) {
      this.token(TokenType.OpeningBrace, "{", 0, match[0].length)
      this.pushRegion(TokenType.ClosingBrace, match[1] ? match[1].length : 0)
    } else if (match = Lexer.CLOSE_BRACE.exec(this.chunk)) {
      this.token(TokenType.ClosingBrace, "}", 0, match[0].length)
    } else if (match = Lexer.COMMA.exec(this.chunk)) {
      this.token(TokenType.Comma, ",", 0, match[0].length)
      this.resetIndents(match[1] ? match[1].length : 0)
    } else if (match = Lexer.COLON.exec(this.chunk)) {
      this.token(TokenType.Colon, ":", 0, match[0].length)
    } else return 0
    return match[0].length
  }

  private commentToken(): number {
    var match: RegExpExecArray
    if (match = Lexer.BLOCK_COMMENT.exec(this.chunk)) {
      var len = match[0].length
      var strChunk = this.chunk.substring(len)
      match = Lexer.BLOCK_NEWLINE.exec(strChunk)
      if (match && match[1].length >= _.last(_.last(this.indents))) {
        var indent = match[1].length
        while (match && match[1].length >= indent) {
          len += match[0].length
          strChunk = strChunk.substring(match[0].length)
          match = Lexer.BLOCK_NEWLINE.exec(strChunk)
        }
      }
      return len
    } else if (match = Lexer.LINE_COMMENT.exec(this.chunk)) {
      return match[0].length
    } else return 0
  }

  private whitespaceToken(): number {
    var match = Lexer.WHITESPACE.exec(this.chunk)
    return match ? match[0].length : 0
  }

  private lineToken(): number {
    var match = Lexer.NEWLINE.exec(this.chunk)
    if (match) {
      var indent = match[2].length
      var currentIndents = _.last(this.indents)
      for (var i = currentIndents.length - 1; i >= 0; i--) {
        if (indent >= currentIndents[i]) {
          _(currentIndents.length - 1 - i).times(() => {
            var outdent = currentIndents.pop()
            this.token(TokenType.Outdent, outdent.toString(), match[1].length + 1, indent)
          })
          if (indent > currentIndents[i]) {
            currentIndents.push(indent)
            this.token(TokenType.Indent, indent.toString(), match[1].length + 1, indent)
          } else if (match[2].indexOf(".") == -1) {
            this.token(TokenType.Newline, "\\n", match[1].length, 1)
          }
          if (match[2].indexOf(".") > -1) {
            this.token(TokenType.Bullet, ".", match[1].length + 1 + match[2].indexOf("."), 1)
          }
          return match[0].length
        }
      }
      this.error("Indentation less than lowest indent in region. Missing a comma?")
    } else return 0
  }

  private numberToken(): number {
    var match = Lexer.NUMBER.exec(this.chunk)
    if (match) {
      var n = match[0]
      if (/^0[BOX]/.test(n)) {
        this.error("radix prefix '" + n + "' must be lowercase")
      } else if (/^0\d*[89]/.test(n)) {
        this.error("decimal literal '" + n + "' must not be prefixed with '0'")
      } else if (/^0\d+/.test(n)) {
        this.error("octal literal '" + n + "' must be prefixed with '0o'")
      }
      var lexedLength = n.length
      if (match = /^0o([0-7]+)/.exec(n)) { // octal
        n = '0x' + parseInt(match[1], 8).toString(16)
      } else if (match = /^0b([01]+)/.exec(n)) { // binary
        n = '0x' + parseInt(match[1], 2).toString(16)
      }
      this.token(TokenType.Number, n, 0, lexedLength)
      return lexedLength
    } else return 0
  }

  private keywordToken(): number {
    if (/^true/.test(this.chunk)) {
      this.token(TokenType.True, "true", 0, 4)
      return 4
    } else if (/^false/.test(this.chunk)) {
      this.token(TokenType.False, "false", 0, 5)
      return 5
    } else if (/^null/.test(this.chunk)) {
      this.token(TokenType.Null, "null", 0, 4)
      return 4
    } else return 0
  }

  private stringToken(): number {
    var match = Lexer.UNQUOTED_STRING.exec(this.chunk)
    var str: string, strChunk: string, len: number, indent: number
    if (match) {
      str = match[0]
      if ((match = Lexer.NUMBER.exec(str)) && match[0].length == str.length) return 0
      if (str == "true" || str == "false" || str == "null" || str == ".") return 0
      this.token(TokenType.String, str, 0, str.length)
      return str.length
    } else if (this.chunk.charAt(0) == "'") {
      if (!(match = /^'((?:''|[^'])*)'/.exec(this.chunk))) {
        this.error("Unclosed single-quoted string")
      }
      this.token(TokenType.String, match[1].replace("''", "'"), 0, match[0].length)
      return match[0].length
    } else if (this.chunk.charAt(0) == '"') {
      for (
        strChunk = this.chunk.substring(1), str = "", len = 1;
        strChunk.length > 0 && strChunk.charAt(0) != '"';
        strChunk = this.chunk.substring(len)
      ) {
        if (match = /^[^\\"]+/.exec(strChunk)) {
          str += match[0]
          len += match[0].length
        } else {
          var resultAndLength = this.parseEscape(strChunk)
          if (!resultAndLength) this.error("Invalid escape sequence")
          str += resultAndLength.result
          len += resultAndLength.length
        }
      }
      if (strChunk.length == 0) this.error("Unclosed double-quoted string")
      this.token(TokenType.String, str, 0, len + 1)
      return len + 1
    } else if (this.chunk.charAt(0) == '`' && (match = Lexer.BLOCK_STRING.exec(this.chunk))) {
      str = match[1]
      len = match[0].length
      strChunk = this.chunk.substring(len)
      match = Lexer.BLOCK_NEWLINE.exec(strChunk)
      if (match && match[1].length > (_.last(_.last(this.indents)))) {
        var indent = match[1].length
        while (match && match[1].length >= indent) {
          if (str.length > 0) str += "\n"
          str += match[0].substring(indent + 1)
          len += match[0].length
          strChunk = strChunk.substring(match[0].length)
          match = Lexer.BLOCK_NEWLINE.exec(strChunk)
        }
      }
      this.token(TokenType.String, str, 0, len)
      return len
    } else return 0
  }

  private parseEscape(strChunk: string): ResultAndLength {
    if (strChunk.length < 2 || strChunk.charAt(0) != '\\') return null
    switch (strChunk.charAt(1)) {
      case 'n': return { result: '\n', length: 2 }
      case 'r': return { result: '\r', length: 2 }
      case 't': return { result: '\t', length: 2 }
      case 'b': return { result: '\b', length: 2 }
      case 'f': return { result: '\f', length: 2 }
      case '\\': return { result: '\\', length: 2 }
      case '/': return { result: '\/', length: 2 }
      case "'": return { result: "'", length: 2 }
      case '"': return { result: '"', length: 2 }
      case 'u': if (/^\\u[0-9a-f]{4}/i.test(strChunk)) return {
          result: String.fromCharCode(parseInt(strChunk.substr(2, 4), 16)),
          length: 6
        }
      default: return null
    }
  }

  private getLocationFromChunk(offset: number): SourceLocation {
    if (offset === 0) return this.chunkLocation
    var s = (offset >= this.chunk.length) ? this.chunk : this.chunk.substring(0, offset)
    var lineCount = 0
    for (var i = s.indexOf('\n'); i > -1; i = s.indexOf('\n', i + 1)) lineCount++
    var column = this.chunkLocation.column
    if (lineCount > 0) column = _(s.split("\n")).last().length
    else column += s.length
    return {
      line: this.chunkLocation.line + lineCount,
      column: column
    }
  }

  private token(type: TokenType, value: string, offsetInChunk: number, length: number): Token {
    if (this.ends.length > 0 && _.last(this.ends) === type) this.popRegion()
    var token = {
      type: type,
      value: value,
      start: this.getLocationFromChunk(offsetInChunk),
      end: this.getLocationFromChunk(offsetInChunk + length)
    }
    this.tokens.push(token)
    return token
  }

  private pushRegion(endType: TokenType, baseIndent: number): void {
    this.ends.push(endType)
    this.indents.push([baseIndent])
  }

  private popRegion(): void {
    this.ends.pop()
    var killedIndents = this.indents.pop()
    while (killedIndents.length > 1) {
      this.token(TokenType.Outdent, killedIndents.pop().toString(), 0, 0)
    }
  }

  private resetIndents(baseIndent: number): void {
    var killedIndents = this.indents.pop()
    while (killedIndents.length > 1) {
      this.token(TokenType.Outdent, killedIndents.pop().toString(), 0, 0)
    }
    this.indents.push([baseIndent])
  }

  private error(message: string): void {
    throw message + " (at line " + (this.chunkLocation.line + 1) + ", column " +
      (this.chunkLocation.column + 1) + ")"
  }
}

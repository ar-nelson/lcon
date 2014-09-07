/// <reference path="lcon-lexer.ts" />
/// <reference path="typings/underscore.d.ts" />
import lexer = require('./lcon-lexer')
import _     = require('underscore')

interface State {
  closingToken: lexer.TokenType
  block: BlockType
}

export interface SyntaxTreeBuilder<A> {
  initObject(start: lexer.SourceLocation): A
  initArray(start: lexer.SourceLocation): A
  appendKeyToObject(key: string, object: A, start: lexer.SourceLocation,
     end: lexer.SourceLocation): void
  appendValueToArray(value: any, array: A): void
  appendValueToObject(value: any, object: A): void
  closeObject(object: A, end: lexer.SourceLocation): void
  closeArray(array: A, end: lexer.SourceLocation): void
  lastElementOfArray(array: A): any
  isObject(thing: any): boolean
  processString(value: string, start: lexer.SourceLocation, end: lexer.SourceLocation): any
  processNumber(value: number, start: lexer.SourceLocation, end: lexer.SourceLocation): any
  processBoolean(value: boolean, start: lexer.SourceLocation, end: lexer.SourceLocation): any
  processNull(start: lexer.SourceLocation, end: lexer.SourceLocation): any
}

enum SubState {
  Key, Value, Comma, AfterIndent
}

enum BlockType {
  Array, Object, Scalar
}

function unexpected(token: lexer.Token): void {
  error("Unexpected " + lexer.TokenType[token.type], token)
}

function error(message: string, token: lexer.Token): void {
  throw message + " (at line " + token.start.line + ", column " + (token.start.column+1) + ")"
}

function emptyToken(type: lexer.TokenType): lexer.Token {
  return {
    type: type,
    value: "",
    start: {line: 0, column: 0},
    end: {line: 0, column: 0}
  }
}

export function parseWithBuilder<A>(src: string, builder: SyntaxTreeBuilder<A>): any {
  var l = new lexer.Lexer()
  return parseTokens(l.tokenize(src), builder)
}

export function parseTokens<A>(tokens: lexer.Token[], builder: SyntaxTreeBuilder<A>): any {
  if (tokens.length === 0) return builder.initObject({line: 0, column: 0}) // Empty object
  else if (tokens.length === 1) switch (tokens[0].type) { // Single value
    case lexer.TokenType.Null:
      return builder.processNull(tokens[0].start, tokens[0].end)
    case lexer.TokenType.True:
      return builder.processBoolean(true, tokens[0].start, tokens[0].end)
    case lexer.TokenType.False:
      return builder.processBoolean(false, tokens[0].start, tokens[0].end)
    case lexer.TokenType.Number:
      return builder.processNumber(Number(tokens[0].value), tokens[0].start, tokens[0].end)
    case lexer.TokenType.String:
      return builder.processString(tokens[0].value, tokens[0].start, tokens[0].end)
    default: unexpected(tokens[0])
  }
  var
    states: State[] = [],
    output: A = builder.initArray({line: 0, column: 0}),
    chain: A = output,
    stack: A[] = [chain],
    subState: SubState = SubState.AfterIndent,
    lastKey: string = null,
    pos = -1,
    currentToken: lexer.Token = null,
    nextToken: lexer.Token = tokens[0],
    next: A

  function appendValueToChain(value: any): void {
    if (lastKey !== null || builder.isObject(chain))
      builder.appendValueToObject(value, chain)
    else builder.appendValueToArray(value, chain)
  }

  function keyState(): void {
    if (currentToken.type === lexer.TokenType.String) {
      builder.appendKeyToObject(currentToken.value, chain, currentToken.start, currentToken.end)
      lastKey = currentToken.value
      subState = SubState.Value
    } else error(
      "Expected key (String), got " + lexer.TokenType[currentToken.type] + " instead.",
      currentToken
    )
  }

  function valueState(): void {
    var paren = false
    switch (currentToken.type) {
      case lexer.TokenType.Null:
        appendValueToChain(builder.processNull(currentToken.start, currentToken.end))
        subState = SubState.Comma
        break
      case lexer.TokenType.True:
        appendValueToChain(builder.processBoolean(true, currentToken.start, currentToken.end))
        subState = SubState.Comma
        break
      case lexer.TokenType.False:
        appendValueToChain(builder.processBoolean(false, currentToken.start, currentToken.end))
        subState = SubState.Comma
        break
      case lexer.TokenType.Number:
        appendValueToChain(builder.processNumber(Number(currentToken.value), currentToken.start,
          currentToken.end))
        subState = SubState.Comma
        break
      case lexer.TokenType.String:
        switch (nextToken ? nextToken.type : lexer.TokenType.Newline) {
          case lexer.TokenType.Bullet:
          case lexer.TokenType.Comma:
          case lexer.TokenType.Newline:
          case lexer.TokenType.ClosingBrace:
          case lexer.TokenType.ClosingBracket:
          case lexer.TokenType.ClosingParen:
          case lexer.TokenType.Outdent:
            appendValueToChain(builder.processString(currentToken.value, currentToken.start,
              currentToken.end))
            subState = SubState.Comma
            break
          default:
            next = builder.initObject(currentToken.start)
            builder.appendKeyToObject(currentToken.value, next, currentToken.start,
               currentToken.end)
            appendValueToChain(next)
            chain = next
            break
        }
        break
      case lexer.TokenType.Indent:
        subState = SubState.AfterIndent
        break
      case lexer.TokenType.OpeningParen:
        paren = true
      case lexer.TokenType.OpeningBrace:
        states.push({
          closingToken: paren ? lexer.TokenType.ClosingParen : lexer.TokenType.ClosingBrace,
          block: BlockType.Object
        })
        next = builder.initObject(currentToken.start)
        appendValueToChain(next)
        stack.push(next)
        chain = next
        subState = SubState.Key
        break
      case lexer.TokenType.OpeningBracket:
        states.push({ closingToken: lexer.TokenType.ClosingBracket, block: BlockType.Array })
        next = builder.initArray(currentToken.start)
        appendValueToChain(next)
        stack.push(next)
        chain = next
        subState = SubState.Value
        break
      default:
        unexpected(currentToken)
    }
  }

  function commaState(): void {
    switch (currentToken.type) {
      case lexer.TokenType.Newline:
        if (lastKey !== null) {
          error("Key '" + lastKey + "' is missing a value.", currentToken)
        }
        if (state && state.block === BlockType.Array) {
          var lastItem = builder.lastElementOfArray(_.last(stack))
          if (builder.isObject(lastItem)) chain = lastItem
          else unexpected(currentToken)
        } else chain = _.last(stack)
        subState = SubState.Key
        break
      case lexer.TokenType.Comma:
        chain = _.last(stack)
        subState = (state && state.block !== BlockType.Object) ? SubState.Value : SubState.Key
        break
      case lexer.TokenType.Bullet:
        if (state && state.block === BlockType.Array) {
          chain = _.last(stack)
          subState = SubState.Value
        } else error("Bullets (-) are not valid outside of an array", currentToken)
        break
      default:
        unexpected(currentToken) // TODO: More informative error message?
    }
  }

  function afterIndentState(): void {
    //console.log("AFTER INDENT: output=" + out)
    if (currentToken.type === lexer.TokenType.Outdent) {
      error("Empty indented block.", currentToken)
    } else if (
      currentToken.type === lexer.TokenType.String &&
      nextToken.type !== lexer.TokenType.Outdent
    ) {
      states.push({ closingToken: lexer.TokenType.Outdent, block: BlockType.Object })
      next = builder.initObject(currentToken.start)
      appendValueToChain(next)
      stack.push(next)
      chain = next
      subState = SubState.Key
      keyState()
    } else if (currentToken.type === lexer.TokenType.Bullet) {
      states.push({ closingToken: lexer.TokenType.Outdent, block: BlockType.Array })
      next = builder.initArray(currentToken.start)
      appendValueToChain(next)
      stack.push(next)
      chain = next
      subState = SubState.Value
    } else {
      states.push({ closingToken: lexer.TokenType.Outdent, block: BlockType.Scalar })
      subState = SubState.Value
      valueState()
    }
  }

  while (++pos < tokens.length) {
    var state = states.length > 0 ? _.last(states) : null
    currentToken = nextToken
    nextToken = (pos < tokens.length - 1) ? tokens[pos + 1] : null
    // Close an open object or array
    if (state && currentToken.type === state.closingToken) {
      switch (state.block) {
        case BlockType.Object:
          if (subState === SubState.Value) {
            error("Key '" + lastKey + "' is missing a value.", currentToken)
          }
          builder.closeObject(stack.pop(), currentToken.end)
          chain = _.last(stack)
          break
        case BlockType.Array:
          builder.closeArray(stack.pop(), currentToken.end)
          chain = _.last(stack)
          break
        case BlockType.Scalar:
          // Do nothing.
      }
      subState = SubState.Comma
      if (state != null) states.pop()
      continue
    }
    // Parse individual tokens
    var lastSubState = subState
    switch (subState) {
      case SubState.Key: keyState(); break
      case SubState.Value: valueState(); break
      case SubState.Comma: commaState(); break
      case SubState.AfterIndent: afterIndentState(); break
    }
    if (lastSubState !== SubState.Key) lastKey = null
  }
  return builder.lastElementOfArray(output)
}

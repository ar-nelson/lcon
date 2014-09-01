/// <reference path="lcon-lexer.ts" />
/// <reference path="typings/underscore.d.ts" />
import lexer = require('./lcon-lexer')
import _     = require('underscore')

interface State {
  closingToken: lexer.TokenType
  isArray: boolean
}

enum SubState {
  Key, Value, Comma
}

function unexpected(token: lexer.Token): void {
  error("Unexpected " + lexer.TokenType[token.type], token)
}

function error(message: string, token: lexer.Token): void {
  throw message + " (at line " + (token.start.line+1) + ", column " + (token.start.column+1) + ")"
}

export function parse(src: string): any {
  var l = new lexer.Lexer()
  return parseTokens(l.tokenize(src))
}

export function parseTokens(tokens: lexer.Token[]): any {
  if (tokens.length === 0) return [false] // Empty object
  else if (tokens.length === 1) switch (tokens[0].type) { // Single value
    case lexer.TokenType.Null: return null
    case lexer.TokenType.True: return true
    case lexer.TokenType.False: return false
    case lexer.TokenType.Number: return Number(tokens[0].value)
    case lexer.TokenType.String: return tokens[0].value
    default: unexpected(tokens[0])
  }
  var
    bareObject = tokens[0].type === lexer.TokenType.String,
    states: State[] = bareObject ? [{ closingToken: null, isArray: false }] : [],
    output: any[] = bareObject ? [[false]] : [],
    stack: any[][] = bareObject ? [output[0]] : [output],
    chain: any[] = stack[0],
    subState: SubState = bareObject ? SubState.Key : SubState.Value,
    pos = -1,
    currentToken: lexer.Token = null,
    nextToken: lexer.Token = tokens[0],
    next: any

  while (++pos < tokens.length) {
    var state = states.length > 0 ? _.last(states) : null
    currentToken = nextToken
    nextToken = (pos < tokens.length - 1) ? tokens[pos + 1] : null
    // Close an open object or array
    if (state && currentToken.type === state.closingToken) {
      if ((state && state.isArray) || subState !== SubState.Value) {
        subState = SubState.Comma
        stack.pop()
        chain = _.last(stack)
        if (state != null) states.pop()
      } else {
        error("Key '" + _.last(chain) + "' is missing a value.", currentToken)
      }
      continue
    }
    // Parse individual tokens
    switch (subState) {
      case SubState.Key:
        if (currentToken.type === lexer.TokenType.String) {
          chain.push(currentToken.value)
          subState = SubState.Value
        } else error(
          "Expected key (String), got " + lexer.TokenType[currentToken.type] + " instead.",
          currentToken
        )
        break
      case SubState.Value:
        switch (currentToken.type) {
          case lexer.TokenType.Null:
            chain.push(null); subState = SubState.Comma
            break
          case lexer.TokenType.True:
            chain.push(true); subState = SubState.Comma
            break
          case lexer.TokenType.False:
            chain.push(false); subState = SubState.Comma
            break
          case lexer.TokenType.Number:
            chain.push(Number(currentToken.value)); subState = SubState.Comma
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
                chain.push(currentToken.value)
                subState = SubState.Comma
                break
              default:
                next = [false, currentToken.value]
                chain.push(next)
                chain = next
                break
            }
            break
          case lexer.TokenType.Indent:
            if (nextToken && nextToken.type === lexer.TokenType.Bullet) {
              states.push({ closingToken: lexer.TokenType.Outdent, isArray: true })
              next = [true]
              chain.push(next)
              stack.push(next)
              subState = SubState.Comma
            } else {
              states.push({ closingToken: lexer.TokenType.Outdent, isArray: false })
              next = [false]
              chain.push(next)
              stack.push(next)
              chain = next
              subState = SubState.Key
            }
            break
          case lexer.TokenType.OpeningBrace:
            states.push({ closingToken: lexer.TokenType.ClosingBrace, isArray: false })
            next = [false]
            chain.push(next)
            stack.push(next)
            chain = next
            subState = SubState.Key
            break
          case lexer.TokenType.OpeningBracket:
            states.push({ closingToken: lexer.TokenType.ClosingBracket, isArray: true })
            next = [true]
            chain.push(next)
            stack.push(next)
            chain = next
            subState = SubState.Value
            break
          case lexer.TokenType.OpeningParen:
            states.push({ closingToken: lexer.TokenType.ClosingParen, isArray: false })
            next = [false]
            chain.push(next)
            stack.push(next)
            chain = next
            subState = SubState.Key
            break
          default:
            unexpected(currentToken)
        }
        break
      case SubState.Comma:
        switch (currentToken.type) {
          case lexer.TokenType.Newline:
            if (state && state.isArray) {
              var lastItem = _.last(_.last(stack)) 
              if (_.isArray(lastItem) && lastItem[0] === false) chain = lastItem
              else if (_.isString(lastItem)) {
                error("Key '" + lastItem + "' is missing a value.", currentToken)
              } else unexpected(currentToken)
            } else chain = _.last(stack)
            subState = SubState.Key
            break
          case lexer.TokenType.Comma:
            chain = _.last(stack)
            subState = (state && state.isArray) ? SubState.Value : SubState.Key
            break
          case lexer.TokenType.Bullet:
            if (state && state.isArray) {
              chain = _.last(stack)
              subState = SubState.Value
            } else error("Bullets (-) are not valid outside of an array", currentToken)
            break
          default:
            unexpected(currentToken) // TODO: More informative error message?
        }
        break
    }
  }

  return output[0]
}

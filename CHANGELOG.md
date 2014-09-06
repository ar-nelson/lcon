# LCON Changelog

## 1.0.0

- npm module now includes TypeScript definitions.
- Block strings and comments were severely broken; now fixed.
- Changed block string delimiter from double-backtick to triple-quote.
- Changed comment character from `;` to `#`.
- Changed bullet character from `.` to `-`.
- Removed single-quoted strings.
- Scalars (strings, numbers, booleans, null) are now valid after an indent.
- Lexer now treats colons as whitespace (fixed error when parsing JSON).
- Stringify functions now available.
- Unit tests are now available, via a custom test script (lcon-test.ts). 
- Command-line tool now has colored output.
- Command-line tool now prints usage when given no arguments.

## 0.1.3

Initial release.

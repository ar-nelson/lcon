
LCON - Ludicrously Compact Object Notation
==========================================

LCON (pronounced "ell-con") is an alternate syntax for JSON, designed to be quickly human-_writable_ as well as readable. It is similar to YAML, but it has less syntactic noise and translates directly to JSON, without any of YAML's extra data features.

LCON was initially designed to be used as the default syntax of a Lisp-like programming language based on JSON rather than S-expressions. Many of its features are better suited for this kind of data than for configuration files or other typical applications of JSON.

### Why use LCON instead of YAML?

LCON is ludicrously compact (obviously). Here's [a JSON schema](http://json-schema.org/examples.html) in LCON:

    title "Example Schema"
    type object
    properties
      firstName type string
      lastName type string
      age (description "Age in years", type integer, minimum 0)
    required [firstName, lastName]

Most LCON documents are just sequences of indented strings, with little or no punctuation (not even colons); whitespace provides most of the necessary context.

Here are some more specific reasons to choose LCON over YAML:

* Your data contains a lot of nested single-element objects like this:

        object:
          part:
            location:
              x: 1.0
              y: 9.1

  ...and you wish you could write them like this instead:
  
        object part location
          x 1.0
          y 9.1

  (Or, to save even more space...)
  
        object part location (x 1.0, y 9.1)

* Your data is just JSON, and doesn't need any of YAML's extra features; you just want a more convenient format.

* Key order is significant in your data. LCON has a parsing mode that preserves key order, and can even be used as a key-order-preserving JSON parser.

## Usage

LCON can be installed through npm: `npm install -g lcon`

### Command-line

Running `lcon foo.lcon` will attempt to convert `foo.lcon` into `foo.json` in the same directory.

Options:

- `-s`, `--stdout`: Output to stdout instead of a new file.

- `-p`, `--pretty-print`: Pretty-print indented JSON output.

- `-o`, `--ordered`: Use ordered JSON output (see next section, "Node Library")

### Node Library

```javascript
var LCON = require('lcon')

// Parse LCON like JSON, into standard JavaScript objects:
LCON.parseUnordered("(a 5, b [1, 2, 3])")
// => {a: 5, b: [1, 2, 3]}

// Parse LCON into a special JSON format where key order is preserved.
// Objects are arrays that start with `false`; actual arrays start with `true`.
LCON.parseOrdered("(a 5, b [1, 2, 3])")
// => [false, "a", 5, "b", [true, 1, 2, 3]]

// Converts ordered JSON data into standard, unordered JSON data
LCON.orderedToUnordered([false, "a", 5, "b", [true, 1, 2, 3]])
// => {a: 5, b: [1, 2, 3]}
```

## Examples

The below examples show JSON data that has been rewritten as LCON. The reader will first notice that it looks extremely similar to YAML; the most significant differences are the lack of colons and the use of `.` instead of `-` as a list bullet character.

From [json.org](http://json.org/example):

    glossary
      title "example glossary"
      GlossDiv
        title S
        GlossList GlossEntry
          ID SGML
          SortAs SGML
          GlossTerm "Standard Generalized Markup Language"
          Acronym SGML
          Abbrev "ISO 8879:1986"
          GlossDef
            para ``
              A meta-markup language, used to create markup languages such as DocBook.
            GlossSeeAlso
            . GML
            . XML
          GlossSee markup

An example of a [Facebook JSON file](http://www.sitepoint.com/facebook-json-example/):

     data
     . id X999_Y999
       from
         name "Tom Brady"
         id X12
       message "Looking forward to 2010!"
       actions
       . name Comment
         link 'http://www.facebook.com/X999/posts/Y999'
       . name Like
         link 'http://www.facebook.com/X999/posts/Y999'
       type status
       created_time '2010-08-02T21:27:44+0000'
       updated_time '2010-08-02T21:27:44+0000'

     . id X998_Y998
       from
         name "Peyton Manning"
         id X18
       message "Where's my contract?"
       actions
       . name Comment
         link 'http://www.facebook.com/X998/posts/Y998'
       . name Like
         link 'http://www.facebook.com/X998/posts/Y998'
       type status
       created_time '2010-08-02T21:27:44+0000'
       updated_time '2010-08-02T21:27:44+0000'

A full JSON schema for a [UNIX fstab-like file](http://json-schema.org/example2.html) (this makes more extensive use of one of LCON's space-saving features: a sequence of space-separated strings become nested single-element objects):

    id 'http://some.site.somewhere/entry-schema#'
    $schema 'http://json-schema.org/draft-04/schema#'
    description "schema for an fstab entry"
    type object
    required [storage]
    properties
      storage
        type object
        oneOf
        . $ref #/definitions/diskDevice
        . $ref #/definitions/diskUUID
        . $ref #/definitions/nfs
        . $ref #/definitions/tmpfs
      fstype enum [ext3, ext4, btrfs]
      options
        type array
        minItems 1
        items type string
        uniqueItems true
      readonly type boolean

    definitions
      diskDevice
        properties
          type enum [disk]
          device
            type string
            pattern '^/dev/[^/]+(/[^/]+)*$'
        required [type, device]
        additionalProperties false
      diskUUID
        properties
          type enum [disk]
          label
            type string
            pattern ``
              ^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$
        required [type, label]
        additionalProperties false
      nfs
        properties
          type enum [nfs]
          remotePath
            type string
            pattern '^(/[^/]+)+$'
          server
            type string
            oneOf
            . format host-name
            . format ipv4
            . format ipv6
        required [type, server, remotePath]
        additionalProperties false
      tmpfs
        properties
          type enum [tmpfs]
          sizeInMB
            type integer
            minimum 16
            maximum 512
        required [type, sizeInMB]
        additionalProperties false

## Syntax

### JSON Compatibility

All JSON is valid LCON. LCON does not include any data types or structures that are not supported by JSON.

### Significant Whitespace

#### Inferred Punctuation

The colon (`:`) is not always necessary for key-value pairs in LCON. Any string followed by one or more spaces or tabs, then a value, is interpreted as a key-value pair. As a result, this:

    {"x": 5.0, "y": 10.5}


can be written like this:

    {"x" 5.0, "y" 5.0}

When an object contains only one key-value pair, the braces can be inferred as well. So, this:

    {"a": {"b": {"c": {"d": "e"}}}}


can be written like this:

    "a" "b" "c" "d" "e"

#### YAML-style Objects

LCON supports maps written in a YAML-like style, with significant whitespace.

    "a":
      "b":
        "foo": "bar"
      "c": [1, 2, 3, 4]

Part of this is an extension of the inferred punctuation feature: when two key-value pairs are written on two adjacent lines, at the same indentation level, a comma is inferred between them. Inferred colons also allow the above to be written like this:

    "a"
      "b" "foo" "bar"
      "c" [1, 2, 3, 4]

#### Bulleted Lists

LCON also supports indentation-sensitive lists, silimar to YAML's bulleted lists. While YAML uses the `-` character as a bullet, LCON uses `.`.

    "list"
      . "first item"
      . "key1" "value1"
        "key2" "value2"
      . "third item"

LCON also interprets bullets at the same indentation depth as a key to be under that key, allowing two-space indentation.

    "list"
    . 1
    . "nested list"
      . 10
      . 20
      . 30
    . 3

To nest a list as an element of another list, start a new line immediately after a bullet.

    .
      . 5
      . 10
    .
      . 50
      . 100

A bullet must be the first non-whitespace chartacter on a line, and must be surrounded by whitespace; a `.` connected to other characters will be interpreted as part of a number or unquoted string.

#### Comma Matching

Mixing JSON-style objects and lists with LCON-style indented objects and bulleted lists can make the meaning of commas ambiguous. To resolve this ambiguity, the following rule applies:

> Literal commas are always matched with the outermost pair of literal braces or brackets. They are never matched with inferred braces or brackets.

As a result, this:

    [
      "a" "b"
      "c" "d"
    ]

is equivalent to this:

    [{"a": "b", "c": "d"}]

whereas this:

    [
      "a" "b",
      "c" "d"
    ]

is equivalent to this:

    [{"a": "b"}, {"c": "d"}]

Within literal braces, commas may be either written or inferred. Writing a literal comma resets the indentation; as a result, the following is valid, and is a single-level object:

    {
      "a": "b"
      "c": "d",
        "e": "f"
        "g": "h"
    }

### Strings

#### Single-quoted Strings

Strings in LCON may be surrounded with single quotes (`'`) as well as double quotes (`"`). Escapes are not parsed within single-quoted strings, although the sequence `''` is interpreted as a literal `'`. Like double-quoted strings, single-quoted strings can span multiple lines.

#### Block Strings

If a line ends with a double-backtick (``` `` ```), all indented text after that line is interpreted as a string. This text is completely literal, with no support for escapes; this behavior is identical to YAML's literal block scalars.

    'name': 'Bob'
    'age': 33
    'address': ``
      91 Fake St.
      Zzyzx, CA 92309

#### Unquoted Strings

Any sequence of non-reserved characters that does not form a JSON number and is not one of `true`, `false`, or `null` is interpreted as a string. Unquoted strings do not support escaping; an unquoted `\` is read as a literal `\`.

Here are a few examples from previous sections, rewritten with unquoted strings:

    a
      b foo bar
      c [1, 2, 3, 4]

---

    list
      . 'first item'
      . key1 value1
        key2 value2
      . 'third item'

---

    name Bob
    age 33
    address ``
      91 Fake St.
      Zzyzx, CA 92309

#### Reserved Characters

The following characters, as well as all whitespace characters, are reserved in LCON:

    {}[](),.;:'"`

These characters cannot be used as part of an unquoted string (except for `.`, which is only reserved when it is a single word surrounded by whitespace; see the section on bulleted lists).

### Parentheses

Parentheses can be used for objects instead of braces. This is purely for aesthetic purposes; parentheses often look "cleaner" to read than braces.

    {a 1, b 2, c 3}
    (a 1, b 2, c 3)

### Comments

#### Line Comments

LCON line comments start with `;`, exactly like Lisp comments.

    a b c d ; This is three nested objects.

#### Block Comments

LCON block comments work like block strings. A block comment starts with the sequence `;:`, and includes all indented text following the `;:`.

    person
      name Bob
      age 33
      ;:
        This is a comment, not part of the data.
        Still a comment!
      address ``
        91 Fake St.
        Zzyzx, CA 92309

## License

LCON is distributed under the BSD license.

    Copyright (c) 2014, Adam R. Nelson
    All rights reserved.
    
    Redistribution and use in source and binary forms, with or without modification,
    are permitted provided that the following conditions are met:
    
    1. Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
    
    2. Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.
    
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
    ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
    FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
    DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
    SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
    CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
    TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
    THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

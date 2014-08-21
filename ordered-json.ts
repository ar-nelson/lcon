/// <reference path="typings/underscore.d.ts" />
import _ = require('underscore')

export function orderedToUnordered(orderedJson: any): any {
  if (_.isArray(orderedJson)) {
    if (orderedJson[0]) {
      return _(orderedJson.slice(1)).map(orderedToUnordered)
    } else {
      var object = new Object(null)
      for (var i = 1; i < orderedJson.length; i += 2) {
        object[orderedJson[i]] = orderedToUnordered(orderedJson[i+1])
      }
      return object
    }
  } else return orderedJson
}

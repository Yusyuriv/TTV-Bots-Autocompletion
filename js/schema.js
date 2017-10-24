const schema = {
  "patternProperties": {
    "^.*$": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string"
          },
          "descriptions": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "properties": {
                "groups": {
                  "oneOf": [
                    {
                      "type": "string",
                      "enum": [ "Everyone", "Regulars", "Subscribers", "Moderators", "Broadcaster" ]
                    },
                    {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "enum": [ "Everyone" ],
                        "minItems": 1,
                        "maxItems": 1
                      }
                    },
                    {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "enum": [
                          "Regulars", "Subscribers", "Moderators", "Broadcaster"
                        ]
                      },
                      "uniqueItems": true
                    }
                  ]
                },
                "text": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    }
  }
};
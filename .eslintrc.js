module.exports = {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@/_navigation/*"],
            "message": "Import navigation only via @/_navigation"
          }
        ]
      }
    ]
  }
};

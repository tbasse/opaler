process.env.TZ = 'Australia/Sydney';

module.exports = {
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "testRegex": "(/__tests__)/.*\\.test\\.ts$",
  "moduleFileExtensions": ["ts", "js", "json", "node"]
}

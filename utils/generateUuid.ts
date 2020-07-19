const { GAME_ID_LENGTH } = require("../config/app.json");

export default function generateUuid(): String {
  const alphabet: String[] = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&_-".split(
    ""
  );

  let uuid = "";

  for (let i = 0; i < GAME_ID_LENGTH; i++) {
    uuid += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return uuid;
}

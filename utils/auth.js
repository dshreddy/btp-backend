const bcrypt = require("bcrypt");
const crypto = require("crypto");

const algorithm = "aes-256-cbc"; // AES algorithm

/**
 * Encrypts a given text using AES-256-CBC.
 * @param {string} text - The plaintext message to encrypt.
 * @returns {string} - The encrypted message in Base64 format.
 */
exports.encrypt = (text, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return `${iv.toString("base64")}:${encrypted}`; // Store IV with the encrypted data
};

/**
 * Decrypts an encrypted message using AES-256-CBC.
 * @param {string} encryptedText - The encrypted message in Base64 format.
 * @returns {string} - The decrypted plaintext message.
 */
exports.decrypt = (encryptedText, key) => {
  const [ivBase64, data] = encryptedText.split(":");
  const iv = Buffer.from(ivBase64, "base64");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(data, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

/*
how to use the above encrypt and decrypt
--------------------------------------------------------------
let key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");   // get the key from env
let message = "sagar";
let encrypted_message = encrypt(message, key);              // encrypt the message
console.log("Encrypted message: ", encrypted_message);
let decrypted_message = decrypt(encrypted_message, key);    // decrypt the message
console.log("Decrypted_message: ", decrypted_message);
*/

//HASH FUNCTION
exports.hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

// COMPARE || DECRYPT FUNCITON
exports.comparePassword = (password, hashed) => {
  return bcrypt.compare(password, hashed);
};

const bip39 = require("bip39")
const ecc = require("tiny-secp256k1")
const { BIP32Factory } = require("bip32")
const fs = require("fs").promises

// Initialize BIP32 with a tiny-secp256k1 compatible implementation
const bip32 = BIP32Factory(ecc)

/**
 * Generates and logs fingerprints for a given seed phrase and a list of passphrases.
 * It stops when it finds a match. Otherwise it logs all fingerprints.
 *
 * @param {string} seedPhrase - The mnemonic seed phrase.
 * @param {string} passphrasesFile - File path containing a list of passphrases, one per line.
 * @param {string} expectedFingerprint - The expected fingerprint to match against.
 * @param {boolean} logging - Whether to log or not
 *
 * @returns {object} - An object containing the match status and the passphrase that matched.
 */
async function generateFingerprints(seedPhrase, passphrasesFile, expectedFingerprint, logging = true) {
	if (!bip39.validateMnemonic(seedPhrase)) {
		if (logging) console.log("Invalid seed phrase. Please check your seed phrase and try again.")
		return { match: false }
	}

	let passphrases = []
	let result

	try {
		const fileContents = await fs.readFile(passphrasesFile, "utf8")
		passphrases = fileContents.split("\n")
	} catch (error) {
		if (logging) console.log("Error reading file. Please check your file path and try again.")
		return { match: false }
	}

	for (let passphrase of passphrases) {
		if (logging) console.log("- - - Trying passphrase: " + passphrase + " - - -")
		result = await logFingerprintForPassphrase(seedPhrase, passphrase, expectedFingerprint, logging)
		if (result.match) {
			break
		}
	}

	if (result.match) {
		if (logging) console.log(" = = = = = MATCH FOUND = = = = =")
		if (logging) console.log("The passphrase that matches the expected fingerprint is: " + result.passphrase)
	} else {
		if (logging) console.log("No match found. Please try again with other passphrases.")
	}

	return result
}

/**
 * Logs the fingerprint for a given seed phrase and passphrase.
 * Additionally, checks lowercase, uppercase and reversed versions of the passphrase.
 * Alerts if any generated fingerprint matches an expected value.
 * Returns the passphrase that matched or false if no match was found.
 *
 * @param {string} seedPhrase - The mnemonic seed phrase.
 * @param {string} passphrase - The passphrase to generate the fingerprint.
 * @param {string} expectedFingerprint - The expected fingerprint to match against.
 * @param {boolean} logging - Whether to log or not
 *
 * @returns {object} - An object containing the match status and the passphrase that matched.
 */
async function logFingerprintForPassphrase(seedPhrase, passphrase, expectedFingerprint, logging = true) {
	// list all variations of the passphrase to test
	lowercasePassphrase = passphrase.toLowerCase()
	uppercasePassphrase = passphrase.toUpperCase()
	reversedPassphrase = passphrase.split(" ").reverse().join(" ")
	passphraseOnlyFirstLetterUppercase = passphrase.charAt(0).toUpperCase() + passphrase.slice(1).toLowerCase()
	// Add other variations here like passphrase with spaces, passphrase with character replacements, etc.

	const passphrasePermutations = [passphrase, lowercasePassphrase, uppercasePassphrase, reversedPassphrase, passphraseOnlyFirstLetterUppercase]

	// Process all permutations
	for (const passphrase of passphrasePermutations) {
		const fingerprintResults = await testAndLogFingerprint(seedPhrase, passphrase, expectedFingerprint, logging)
		if (fingerprintResults.match) {
			return { match: true, passphrase: passphrase }
		}
	}

	if (logging) console.log("- - -")
	return { match: false }
}

/**
 * Helper function to generate fingerprint, log it, and check against the expected fingerprint.
 *
 * @param {string} seedPhrase - The mnemonic seed phrase.
 * @param {string} passphrase - The passphrase to generate the fingerprint.
 * @param {string} expectedFingerprint - The expected fingerprint to match against.
 * @param {boolean} logging - Whether to log or not
 *
 * @returns {object} - An object containing the match status.
 */
async function testAndLogFingerprint(seedPhrase, passphrase, expectedFingerprint, logging = true) {
	const seed = await bip39.mnemonicToSeed(seedPhrase, passphrase)
	const root = bip32.fromSeed(seed)
	const fingerprint = root.fingerprint.toString("hex")

	if (logging) console.log(`Passphrase: ${passphrase} - Fingerprint: ${fingerprint}`)

	if (fingerprint === expectedFingerprint.toLowerCase()) {
		return { match: true }
	}

	return { match: false }
}

// Example usage
const seedPhrase = "{your seed phrase here}"
const passphrasesFile = "passphrases.txt" // path fo the file containing a list of passphrases, one per line; change if needed
const expectedFingerprint = "{your expected fingerprint here}" // Change if needed

// Read passphrases from file and process each
// Assuming generateFingerprints function is modified to call this new version of logFingerprintForPassphrase
generateFingerprints(seedPhrase, passphrasesFile, expectedFingerprint).catch((error) => console.error(error))

module.exports = { generateFingerprints, logFingerprintForPassphrase, testAndLogFingerprint }

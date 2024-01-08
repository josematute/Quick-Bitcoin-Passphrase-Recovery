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

 */
async function generateFingerprints(seedPhrase, passphrasesFile, expectedFingerprint) {
	if (!bip39.validateMnemonic(seedPhrase)) {
		console.log("Invalid seed phrase. Please check your seed phrase and try again.")
	}

	let passphrases = []
	let result

	try {
		const fileContents = await fs.readFile(passphrasesFile, "utf8")
		passphrases = fileContents.split("\n")
	} catch (error) {
		console.log("Error reading file. Please check your file path and try again.")
	}

	for (let passphrase of passphrases) {
		console.log("- - - Trying passphrase: " + passphrase + " - - -")
		result = await logFingerprintForPassphrase(seedPhrase, passphrase, expectedFingerprint)
		if (result.match) {
			break
		}
	}

	if (result.match) {
		console.log(" = = = = = MATCH FOUND = = = = =")
		console.log("The passphrase that matches the expected fingerprint is: " + result.passphrase)
	} else {
		console.log("No match found. Please try again with other passphrases.")
	}

	return result
}

/**
 * Logs the fingerprint for a given seed phrase and passphrase.
 * Additionally, checks lowercase, uppercase and reversed versions of the passphrase.
 * Alerts if any generated fingerprint matches an expected value.
 *
 * @param {string} seedPhrase - The mnemonic seed phrase.
 * @param {string} passphrase - The passphrase to generate the fingerprint.
 * @param {string} expectedFingerprint - The expected fingerprint to match against.
 */
async function logFingerprintForPassphrase(seedPhrase, passphrase, expectedFingerprint) {
	let fingerprintResults

	// Process the original passphrase
	fingerprintResults = await testAndLogFingerprint(seedPhrase, passphrase, expectedFingerprint)
	if (fingerprintResults.match) {
		return { match: true, passphrase: passphrase }
	}

	// Process the lowercase passphrase
	fingerprintResults = await testAndLogFingerprint(seedPhrase, passphrase.toLowerCase(), expectedFingerprint)
	if (fingerprintResults.match) {
		return { match: true, passphrase: passphrase }
	}

	// Process the uppercase passphrase
	fingerprintResults = await testAndLogFingerprint(seedPhrase, passphrase.toUpperCase(), expectedFingerprint)
	if (fingerprintResults.match) {
		return { match: true, passphrase: passphrase }
	}

	// Process the reversed seedphrase
	fingerprintResults = await testAndLogFingerprint(seedPhrase, passphrase.split("").reverse().join(""), expectedFingerprint)
	if (fingerprintResults.match) {
		return { match: true, passphrase: passphrase }
	}

	// Add other variations here like passphrase with spaces, passphrase with character replacements, etc.

	console.log("- - -")
	return { match: false }
}

/**
 * Helper function to generate fingerprint, log it, and check against the expected fingerprint.
 *
 * @param {string} seedPhrase - The mnemonic seed phrase.
 * @param {string} passphrase - The passphrase to generate the fingerprint.
 * @param {string} expectedFingerprint - The expected fingerprint to match against.
 */
async function testAndLogFingerprint(seedPhrase, passphrase, expectedFingerprint) {
	const seed = await bip39.mnemonicToSeed(seedPhrase, passphrase)
	const root = bip32.fromSeed(seed)
	const fingerprint = root.fingerprint.toString("hex")

	console.log(`Passphrase: ${passphrase} - Fingerprint: ${fingerprint}`)

	if (fingerprint === expectedFingerprint.toLowerCase()) {
		return { match: true }
	}

	return { match: false }
}

// Example usage
const seedPhrase =
	"share spend art rug orphan member mixed pause raccoon rule cable inquiry volume cost symptom elephant violin door place avocado hazard eye brave broccoli"
const passphrasesFile = "passphrases.txt" // File containing a list of passphrases, one per line; change if needed
const expectedFingerprint = "3df66e66" // Change if needed

// Read passphrases from file and process each
// Assuming generateFingerprints function is modified to call this new version of logFingerprintForPassphrase
generateFingerprints(seedPhrase, passphrasesFile, expectedFingerprint).catch((error) => console.error(error))

module.exports = { generateFingerprints, logFingerprintForPassphrase, testAndLogFingerprint }

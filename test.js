const { generateFingerprints, logFingerprintForPassphrase, testAndLogFingerprint } = require("./generateFingerprints")

describe("Wallet Fingerprint Generation", () => {
	test("A match was found inside the list of passphrases with a 24 word seedphrase", async () => {
		const seedPhrase =
			"share spend art rug orphan member mixed pause raccoon rule cable inquiry volume cost symptom elephant violin door place avocado hazard eye brave broccoli"
		const passphrasesFile = "test/passphrases-sample.txt"
		const expectedFingerprint = "3df66e66"

		const result = await generateFingerprints(seedPhrase, passphrasesFile, expectedFingerprint)
		await expect(result).toEqual({ match: true, passphrase: "siseneg1" })
	})

	test("Fingerprints do not match expected value", async () => {
		const seedPhrase =
			"share spend art rug orphan member mixed pause raccoon rule cable inquiry volume cost symptom elephant violin door place avocado hazard eye brave broccoli"
		const passphrasesFile = "test/passphrases-sample-2.txt"
		const expectedFingerprint = "3df66e66"

		const result = await generateFingerprints(seedPhrase, passphrasesFile, expectedFingerprint)
		await expect(result).toEqual({ match: false })
	})
})

describe("Wallet Fingerprint Generation", () => {})

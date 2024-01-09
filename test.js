const { generateFingerprints, logFingerprintForPassphrase, testAndLogFingerprint } = require("./generateFingerprints")

describe("Passphrase Generation", () => {
	test("A match was found inside the list of passphrases with a 24 word seedphrase", async () => {
		const seedPhrase =
			"share spend art rug orphan member mixed pause raccoon rule cable inquiry volume cost symptom elephant violin door place avocado hazard eye brave broccoli"
		const passphrasesFile = "test/passphrases-sample.txt"
		const expectedFingerprint = "3df66e66"

		const result = await generateFingerprints(seedPhrase, passphrasesFile, expectedFingerprint, false)
		await expect(result).toEqual({ match: true, passphrase: "SISENEG1" })
	})

	test("A match was not found inside the list of passphrases with a 24 word seedphrase", async () => {
		const seedPhrase =
			"share spend art rug orphan member mixed pause raccoon rule cable inquiry volume cost symptom elephant violin door place avocado hazard eye brave broccoli"
		const passphrasesFile = "test/passphrases-sample-2.txt"
		const expectedFingerprint = "3df66e66"

		const result = await generateFingerprints(seedPhrase, passphrasesFile, expectedFingerprint, false)
		await expect(result).toEqual({ match: false })
	})

	test("A match was found inside the list of passphrases with a 12 word seedphrase", async () => {
		const seedPhrase = "unable cake coral boat dune buzz zebra joy slam talk business render"
		const passphrasesFile = "test/passphrases-sample-3.txt"
		const expectedFingerprint = "9793ec7f"

		const result = await generateFingerprints(seedPhrase, passphrasesFile, expectedFingerprint, false)
		await expect(result).toEqual({ match: true, passphrase: "Satoshi1" })
	})

	test("A match was not found inside the list of passphrases with a 12 word seedphrase", async () => {
		const seedPhrase = "unable cake coral boat dune buzz zebra joy slam talk business render"
		const passphrasesFile = "test/passphrases-sample-4.txt"
		const expectedFingerprint = "9793ec7f"

		const result = await generateFingerprints(seedPhrase, passphrasesFile, expectedFingerprint, false)
		await expect(result).toEqual({ match: false })
	})
})

describe("Other use cases", () => {
	test("Invalid seed phrase", async () => {
		const seedPhrase = "invalid seed phrase"
		const passphrasesFile = "test/passphrases-sample.txt"
		const expectedFingerprint = "abcdef12"

		const result = await generateFingerprints(seedPhrase, passphrasesFile, expectedFingerprint, false)
		await expect(result).toEqual({ match: false })
	})

	test("Empty passphrases file", async () => {
		const seedPhrase = "valid seed phrase..."
		const passphrasesFile = "test/passphrases-empty.txt"
		const expectedFingerprint = "abcdef12"

		const result = await generateFingerprints(seedPhrase, passphrasesFile, expectedFingerprint, false)
		await expect(result).toEqual({ match: false })
	})
})

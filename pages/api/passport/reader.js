import { PassportReader } from '@gitcoinco/passport-sdk-reader';
// --- Base64 encoding
import * as base64 from '@ethersproject/base64';
// --- Crypto lib for hashing
import { createHash, randomBytes } from 'crypto';

async function useReader(address) {
	const reader = new PassportReader();
	const passport = await reader.getPassport(address);
	return passport;
}

export default async function reader(req, res) {
	const address = req.query.address?.toString().toLowerCase();
	// Passport prod node is the default
	const passport = await useReader(address);
	let returnPayload = {};
	let hash = '';

	const key = process.env.IAM_JWK;
	if (!key) {
		return (returnPayload = { error: 'IAM_JWK not found' });
	}

	try {
		// If the user has a passport then continue
		if (passport.expiryDate && passport.issuanceDate) {
			hash = base64.encode(
				createHash('sha256')
					.update(key, 'utf-8')
					.update(JSON.stringify(passport))
					.digest()
			);
			const nonce = randomBytes(16).toString('base64');
			returnPayload = {
				hash: hash,
				nonce: nonce,
			};
		} else {
			returnPayload = { error: 'Passport Not Found' };
		}
	} catch (e) {
		console.error(`ERROR: ${e}`);
	}

	res.setHeader('Access-Control-Allow-Origin', '*');
	res.json(returnPayload);
}

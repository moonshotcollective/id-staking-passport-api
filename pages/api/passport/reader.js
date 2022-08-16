import { PassportReader } from '@gitcoinco/passport-sdk-reader';
// --- Crypto lib for hashing
import { randomBytes } from 'crypto';
// ---- Generate & Verify methods
import * as DIDKit from '@spruceid/didkit-wasm-node';

async function useReader(address, node) {
	const reader = new PassportReader(node);
	const passport = await reader.getPassport(address);
	return passport;
}

export default async function reader(req, res) {
	const address = req.query.address?.toString().toLowerCase();
	const signer = req.query.signer;

	// Passport prod node is the default
	const node = req.query.node || process.env.CERAMIC_CLIENT_URL;
	const result = await useReader(address, node);
	const key = process.env.IAM_JWK || DIDKit.generateEd25519Key();

	let returnPayload = {};

	// If the user has a passport then continue
	if (key && result.expiryDate && result.issuanceDate) {
		//Sign Message
		const signature = await signer.signMessage(result);

		const nonce = randomBytes(16).toString('base64');
		returnPayload = {
			signature: signature,
			timestamp: Date.now(),
			nonce: nonce,
			error: '',
		};
	} else {
		returnPayload.error = 'Passport Not Found';
	}

	res.setHeader('Access-Control-Allow-Origin', '*');
	res.json(returnPayload);
}

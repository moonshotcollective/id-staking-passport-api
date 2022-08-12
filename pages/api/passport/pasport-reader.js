import { PassportReader } from '@gitcoinco/passport-sdk-reader';
// --- Base64 encoding
import * as base64 from '@ethersproject/base64';
// --- Crypto lib for hashing
import { createHash } from 'crypto';
// ---- Generate & Verify methods
import * as DIDKit from '@spruceid/didkit-wasm-node';

async function useReader(address, node) {
	const reader = new PassportReader(node);
	const passport = await reader.getPassport(address);
	return passport;
}

export default async function reader(req, res) {
	var address = req.query.address?.toString().toLowerCase();
	var node = req.query.node || process.env.CERAMIC_CLIENT_URL;
	const result = await useReader(address, node);

	const key = process.env.IAM_JWK || DIDKit.generateEd25519Key();
	let hash = '';

	if (key) {
		hash = base64.encode(
			createHash('sha256')
				.update(key, 'utf-8')
				.update(JSON.stringify(result))
				.digest()
		);
	}

	res.json({ passport: result });
}

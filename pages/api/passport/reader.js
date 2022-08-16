import { StaticJsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { PassportReader } from '@gitcoinco/passport-sdk-reader';
// --- Crypto lib for hashing
import { randomBytes } from 'crypto';

async function useReader(address, node) {
	const reader = new PassportReader(node);
	const passport = await reader.getPassport(address);
	return passport;
}

// Fetch a verifiableCredential
const fetchSignaturePayload = async (passport, signer) => {
	// must provide signature for message
	if (!signer) {
		throw new Error('Unable to sign message without a signer');
	}

	// sign the challenge provided by the IAM
	const signature =
		passport && passport.expiryDate && passport.issuanceDate
			? (await signer.signMessage(JSON.stringify(passport))).toString()
			: '';

	// must provide signature for message
	if (!signature) {
		throw new Error('Unable to sign message');
	}

	const nonce = randomBytes(16).toString('base64');
	// return payload
	return {
		signature: signature,
		timestamp: Date.now(),
		nonce: nonce,
	};
};

export default async function reader(req, res) {
	const address = req.query.address?.toString().toLowerCase();

	// Get the provider
	const provider = new StaticJsonRpcProvider(process.env.MAINNET_RPC_URL);
	const signer = provider.getSigner();

	// Passport prod node is the default
	const node = req.query.node || process.env.CERAMIC_CLIENT_URL;
	const passport = await useReader(address, node);

	let returnPayload = {};
	try {
		// If the user has a passport then continue
		if (passport.expiryDate && passport.issuanceDate) {
			returnPayload = await fetchSignaturePayload(passport, signer);
		} else {
			returnPayload = { error: 'Passport Not Found' };
		}
	} catch (e) {
		console.error(`ERROR: ${e}`);
	}

	res.setHeader('Access-Control-Allow-Origin', '*');
	res.json(returnPayload);
}

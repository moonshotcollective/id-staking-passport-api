import { PassportReader } from '@gitcoinco/passport-sdk-reader';
// --- Crypto lib for hashing
import { randomBytes } from 'crypto';
import { ethers } from 'ethers';

async function useReader(address) {
	const reader = new PassportReader();
	const passport = await reader.getPassport(address);
	return passport;
}

export default async function reader(req, res) {
	// user address
	const address = req.query.address?.toString().toLowerCase();

	// Passport prod node is the default
	const passport = await useReader(address);
	let returnPayload = {};

	// initialize a wallet
	const mnemonic = process.env.PRIVATE_KEY || '';
	const account = ethers.Wallet.fromMnemonic(mnemonic);

	const wallet = new ethers.Wallet(
		account.privateKey,
		ethers.getDefaultProvider()
	);

	if (!wallet || !wallet.privateKey) {
		return (returnPayload = { error: 'Private key not found' });
	}

	try {
		// If the user has a passport then continue
		if (passport.expiryDate && passport.issuanceDate) {
			// signature data
			const nonce = randomBytes(16).toString('base64');
			const timestamp = Date.now();

			// All properties on a domain are optional
			let domain = {
				name: 'IDStaking',
				version: '1.0',
				chainId: '1',
				verifyingContract: process.env.CONTRACT_ADDRESS,
			};

			// The named list of all type definitions
			const types = {
				Data: [
					{ name: 'passport', type: 'string' },
					{ name: 'timestamp', type: 'string' },
					{ name: 'nonce', type: 'string' },
					{ name: 'user', type: 'address' },
				],
			};

			// The data to sign
			const value = {
				passport: JSON.stringify(passport),
				timestamp: timestamp,
				nonce: nonce,
				user: address,
			};

			const signature = await wallet._signTypedData(domain, types, value);

			returnPayload = {
				signature: signature,
				timestamp: timestamp,
				nonce: nonce,
			};
		} else {
			returnPayload = { error: 'Passport Not Found' };
		}
	} catch (e) {
		console.error(`ERROR: ${e}`);
	}

	res.setHeader('Access-Control-Allow-Origin', '*');

	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

	res.setHeader(
		'Access-Control-Allow-Origin',
		'https://goerli-staking.surge.sh/'
	);

	// Request methods you wish to allow
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, OPTIONS, PUT, PATCH, DELETE'
	);

	// Request headers you wish to allow
	res.setHeader(
		'Access-Control-Allow-Headers',
		'X-Requested-With,content-type'
	);

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);

	res.json(returnPayload);
}

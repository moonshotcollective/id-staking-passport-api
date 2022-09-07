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
	const { method } = req;

	// Websites you wish to allow to connect
	const allowedOrigins = [
		'http://localhost:3000',
		'http://localhost:3000/StakeDashboard',
		'https://goerli-staking.surge.sh',
		'https://identity-staking-user-test.surge.sh',
		'https://staking.passport.gitcoin.co',
		'https://identity-staking.vercel.app',
	];
	const origin = req.headers.origin;
	if (allowedOrigins.includes(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin);
	}

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

	// This will allow OPTIONS request
	if (method === 'OPTIONS') {
		return res.status(200).send('ok');
	}

	if (method !== 'POST') {
		return res.status(403).json({ message: 'Invalid request type' });
	}

	// user address
	const address = ethers.utils.getAddress(req.body.address);
	//GET CHAIN ID for Signature domain, default to 1
	const DOMAIN_CHAIN_ID = req.body.domainChainId?.toString().toLowerCase();

	if (!address) {
		res.status(403).json({ message: 'Invalid user address provided' });
	}

	// payload returned by api
	let returnPayload = {};
	// Passport prod node is the default
	const passport = await useReader(address);

	// If the user has a passport then continue
	if (!passport.expiryDate || !passport.issuanceDate) {
		return res.status(403).json({ message: 'Passport Not Found' });
	}

	// initialize a wallet
	const mnemonic = process.env.PRIVATE_KEY || '';
	const account = ethers.Wallet.fromMnemonic(mnemonic);
	const wallet = new ethers.Wallet(
		account.privateKey,
		ethers.getDefaultProvider()
	);

	console.log({ add: wallet.address, address });

	if (!wallet || !wallet.privateKey) {
		return res.status(403).json({ message: 'Private key not found' });
	}

	try {
		// signature data
		const nonce = randomBytes(8).toString('base64');
		// 10 minutes from now
		const timestamp = Math.floor(Date.now() / 1000) + 60 * 10;

		// All properties on a domain are optional
		let domain = {
			name: 'IDStaking',
			version: '1.0',
			chainId: DOMAIN_CHAIN_ID || '1',
			verifyingContract: process.env[`CONTRACT_ADDRESS_${DOMAIN_CHAIN_ID}`],
		};

		// The named list of all type definitions
		const types = {
			Data: [
				{ name: 'nonce', type: 'string' },
				{ name: 'timestamp', type: 'uint256' },
				{ name: 'user', type: 'address' },
			],
		};

		// The data to sign
		const value = {
			nonce,
			timestamp,
			user: address,
		};

		const signature = await wallet._signTypedData(domain, types, value);

		returnPayload = {
			signature: signature,
			timestamp: timestamp,
			nonce: nonce,
		};
	} catch (e) {
		console.error(`ERROR: ${e}`);
	}

	res.json(returnPayload);
}

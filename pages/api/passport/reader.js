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

	const contractName = req.query.contractName?.toString().toLowerCase();
	const verifyingContract = req.query.verifyingContract
		?.toString()
		.toLowerCase();

	// Passport prod node is the default
	const passport = await useReader(address);
	let returnPayload = {};

	const key = process.env.PRIVATE_KEY;
	if (!key) {
		return (returnPayload = { error: 'Private key not found' });
	}

	try {
		// If the user has a passport then continue
		if (passport.expiryDate && passport.issuanceDate) {
			// signature data
			const nonce = randomBytes(16).toString('base64');
			const timestamp = Date.now();

			// initialize a wallet
			const mnemonic = process.env.WALLET_MNEMONIC || '';
			const wallet = ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/1`);

			// All properties on a domain are optional
			let domain = {
				contractName: contractName,
				version: '1',
				chainId: '1',
				verifyingContract: verifyingContract,
			};

			// The named list of all type definitions
			const types = {
				Data: [
					{ name: 'passport', type: 'string' },
					{ name: 'timestamp', type: 'string' },
					{ name: 'nonce', type: 'uint256' },
					{ name: 'user', type: 'address' },
				],
			};

			// The data to sign
			const value = {
				passport: JSON.stringify(passport),
				timestamp: timestamp,
				nonce: nonce,
				address: address,
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
	res.json(returnPayload);
}

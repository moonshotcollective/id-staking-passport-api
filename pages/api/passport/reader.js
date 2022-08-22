import { PassportReader } from '@gitcoinco/passport-sdk-reader';

async function useReader(address, node) {
	const reader = new PassportReader(node);
	const passport = await reader.getPassport(address);
	return passport;
}

export default async function reader(req, res) {
	const address = req.query.address?.toString().toLowerCase();

	// Passport prod node is the default
	const passport = await useReader(address);
	let returnPayload = {};
	// If the user has a passport then continue
	if (passport.expiryDate && passport.issuanceDate) {
		returnPayload = {
			passport: passport,
		};
	} else {
		returnPayload = { error: 'Passport Not Found' };
	}

	res.setHeader('Access-Control-Allow-Origin', '*');
	res.json(returnPayload);
}

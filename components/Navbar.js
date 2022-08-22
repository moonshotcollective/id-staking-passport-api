import React from 'react';

export default function Navbar({ address }) {
	function addressShortner(addressValue) {
		return addressValue?.substr(0, 5) + '...' + addressValue?.substr(-4);
	}

	return (
		<header className='text-gray-600 body-font'>
			<div className='container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center'>
				<a
					className='flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0'
					href='/'
				>
					<span className='ml-3 text-xl'>Passport Lookup Tool</span>
				</a>
				<nav className='md:ml-auto flex flex-wrap items-center text-base justify-center'>
					<a
						className='mr-5 mb-2 block px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition rounded-md'
						href='https://passport.gitcoin.co/'
						target='_blank'
						rel='noopener noreferrer'
					>
						Go To Passport
					</a>

					<span className='mb-2 block px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition rounded-md'>
						Address: {address ? addressShortner(address) : ' enter address'}
					</span>
				</nav>
			</div>
		</header>
	);
}

import React from 'react';

export default function Navbar({ address }) {
	function addressShortner(addressValue) {
		return addressValue?.substr(0, 5) + '...' + addressValue?.substr(-4);
	}

	return (
		<header className='bg-white'>
			<div className='flex items-center h-16 max-w-screen-xl gap-8 px-4 mx-auto sm:px-6 lg:px-8'>
				<a
					className='flex block px-5 py-2.5 text-green-600 bg-gray-100 rounded-md'
					href='/'
				>
					<svg
						className='w-5 h-5'
						fill='currentColor'
						viewBox='0 0 20 20'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							clip-rule='evenodd'
							d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
							fill-rule='evenodd'
						></path>
					</svg>
					Passport Lookup Tool
				</a>

				<div className='flex items-center justify-end flex-1 md:justify-between'>
					<nav className='hidden md:block' aria-labelledby='header-navigation'>
						<h2 className='sr-only' id='header-navigation'>
							Header navigation
						</h2>
					</nav>

					<div className='flex items-center gap-4'>
						<div className='sm:gap-4 sm:flex'>
							<a
								className='block px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition rounded-md'
								href='https://passport.gitcoin.co/'
							>
								Go To Passport
							</a>

							<a
								className='hidden sm:block px-5 py-2.5 text-sm font-medium text-gray-100 bg-green-600 rounded-md hover:text-green-600/75 transition'
								href='/'
							>
								Address: {address ? addressShortner(address) : ' enter address'}
							</a>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });
import useSWR from 'swr';

//import components
import { Navbar } from '../components';

async function fetcher(...arg) {
	// @ts-ignore
	const res = await fetch(...arg);
	console.log('VIEW FETCH ', res);
	return res.json();
}

function Home({ passportData }) {
	const [address, setAddress] = useState('');

	const { data, error } = useSWR(
		`/api/passport/reader?address=${address || ''}`,
		fetcher
	);

	const [isOpen, setIsOpen] = useState(false);

	const changePanel = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div>
			<Navbar address={address} />
			<section className='text-gray-600 body-font'>
				<div className='container px-5 py-10 mx-auto'>
					<div className='flex flex-grow items-center space-x-4 bg-green-500 py-6 px-2 rounded-lg'>
						<form className='mb-0 lg:flex'>
							<div className='relative'>
								<input
									className='h-10 mx-10 pr-10 text-sm placeholder-gray-300 border-gray-200 rounded-lg focus:z-10'
									placeholder='Search address'
									type='text'
									onChange={(e) => setAddress(e.target.value)}
								/>

								<button
									className='absolute inset-y-0 right-0 p-2 mr-px text-gray-600 rounded-r-lg'
									type='submit'
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
								</button>
							</div>
						</form>
					</div>
					<div className='container mx-auto py-10'>
						<div className='flex flex-wrap md:-m-4 md:px-4'>
							{address ? (
								data && data.passport ? (
									data.passport.stamps.map((item, i) => (
										<div className='w-1/2 p-2 md:w-1/2 xl:w-1/4'>
											<div
												className='relative border border-gray-200 p-2'
												key={`${i}+${item}`}
											>
												<h2 className='tracking-widest text-lg title-font font-bold mb-1 underline'>
													{item.provider}
												</h2>
												{/* <h1 className='title-font text-xs text-gray-900 mb-3'>
												{JSON.stringify(item.credential)}
											</h1> */}
												<p className='leading-relaxed mb-3'>
													<span className='font-bold'>Type of Stamp:</span>{' '}
													{item.credential.type}
												</p>
												<p className='leading-relaxed mb-3'>
													<span className='font-bold'>Expiry Date:</span>{' '}
													{Date(item.credential.expirationDate, 'YYYY/MM/DD')}
												</p>
												<p className='leading-relaxed mb-3'>
													<span className='font-bold'>Issance Date:</span>{' '}
													{Date(item.credential.issuanceDate, 'YYYY/MM/DD')}
												</p>
											</div>
										</div>
									))
								) : (
									<div>No Passport found for address entered</div>
								)
							) : (
								<div>Enter an address to view stamps you have verified</div>
							)}
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

export default Home;

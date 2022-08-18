import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });
import useSWR from 'swr';
import { Collapse } from 'antd';

const { Panel } = Collapse;

async function fetcher(...arg) {
	// @ts-ignore
	const res = await fetch(...arg);
	console.log('VIEW FETCH ', res);
	return res.json();
}

function Home({ passportData }) {
	const [issues, setIssues] = useState([]);

	const { data, error } = useSWR(
		'/api/passport/reader?address=0xEC0a73Cc9b682695959611727dA874aFd8440C21',
		fetcher
	);

	const [isOpen, setIsOpen] = useState(false);

	const changePanel = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div className='flex flex-col h-screen'>
			<main className='flex-1 overflow-y-auto p-5'>
				<div className='px-4' style={{ maxWidth: '1600px' }}>
					<div className='text-center mb-4'>
						<h1 className='sm:text-3xl text-2xl font-medium title-font text-gray-900'>
							Passport Stamps
						</h1>
					</div>
					<div
						className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'
						style={{ margin: '10px' }}
					>
						{error && <div>failed to load {JSON.stringify(error)}</div>}

						<Collapse accordion>
							{data &&
								data.passport.stamps.map((item, i) => (
									<Panel header={item.provider} key={`${i}+${item}`}>
										<p>{JSON.stringify(item.credential)}</p>
									</Panel>
								))}
						</Collapse>
						{/* {JSON.stringify(data)} */}
					</div>
				</div>
			</main>
		</div>
	);
}

export default Home;

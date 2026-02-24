import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import ContractViewClient from './contract-view';

jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/store/services/contract', () => ({
	...jest.requireActual('@/store/services/contract'),
	useGetContractQuery: jest.fn(() => ({ data: undefined, isLoading: false, isError: true })),
}));

jest.mock('@/utils/routes', () => ({
	CONTRACTS_LIST: '/contracts',
	CONTRACTS_EDIT: (id: number) => `/contracts/${id}/edit`,
}));

describe('ContractViewClient', () => {
	it('shows error when contract not found', () => {
		render(
			<Provider store={store}>
				<ContractViewClient id={99} />
			</Provider>,
		);
		expect(screen.getByText(/contrat introuvable/i)).toBeInTheDocument();
	});

	it('renders contract details', () => {
		const { useGetContractQuery } = jest.requireMock('@/store/services/contract');
		(useGetContractQuery as jest.Mock).mockReturnValue({
			data: {
				id: 1,
				numero_contrat: 'CTR-001',
				statut: 'Signé',
				date_contrat: '2024-01-10',
				client_nom: 'Jean Dupont',
				montant_ht: 50000,
				devise: 'MAD',
			},
			isLoading: false,
			isError: false,
		});
		render(
			<Provider store={store}>
				<ContractViewClient id={1} />
			</Provider>,
		);
		expect(screen.getAllByText('CTR-001').length).toBeGreaterThan(0);
		expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
	});
});

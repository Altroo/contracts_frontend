import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import ContractsListClient from './contracts-list';

jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/store/services/contract', () => ({
	...jest.requireActual('@/store/services/contract'),
	useGetContractsListQuery: jest.fn(() => ({ data: undefined, isLoading: false, isError: false })),
}));

jest.mock('@/utils/routes', () => ({
	CONTRACTS_ADD: '/contracts/new',
	CONTRACTS_VIEW: (id: number) => `/contracts/${id}`,
	CONTRACTS_EDIT: (id: number) => `/contracts/${id}/edit`,
}));

describe('ContractsListClient', () => {
	it('renders empty state message', () => {
		render(
			<Provider store={store}>
				<ContractsListClient />
			</Provider>,
		);
		expect(screen.getByText(/aucun contrat trouvé/i)).toBeInTheDocument();
	});

	it('renders contracts table columns', () => {
		const { useGetContractsListQuery } = jest.requireMock('@/store/services/contract');
		(useGetContractsListQuery as jest.Mock).mockReturnValue({
			data: [{ id: 1, numero_contrat: 'CTR-001', client_nom: 'Ali', type_contrat: 'travaux_finition', statut: 'Brouillon', date_contrat: '2024-01-01', montant_ht: 10000, devise: 'MAD' }],
			isLoading: false,
			isError: false,
		});
		render(
			<Provider store={store}>
				<ContractsListClient />
			</Provider>,
		);
		expect(screen.getByText('CTR-001')).toBeInTheDocument();
		expect(screen.getByText('Ali')).toBeInTheDocument();
	});
});

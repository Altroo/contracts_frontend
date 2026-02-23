import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import ContractFormClient from './contract-form';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/store/services/contract', () => ({
	useAddContractMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
	useEditContractMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
	useGetContractQuery: jest.fn(() => ({ data: undefined, isLoading: false })),
}));

jest.mock('@/utils/routes', () => ({
	CONTRACTS_LIST: '/contracts',
	CONTRACTS_VIEW: (id: number) => `/contracts/${id}`,
}));

describe('ContractFormClient — add mode', () => {
	it('renders add form title', () => {
		render(
			<Provider store={store}>
				<ContractFormClient />
			</Provider>,
		);
		expect(screen.getByText(/nouveau contrat/i)).toBeInTheDocument();
	});

	it('renders required fields', () => {
		render(
			<Provider store={store}>
				<ContractFormClient />
			</Provider>,
		);
		expect(screen.getByLabelText(/numéro de contrat/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/montant ht/i)).toBeInTheDocument();
	});
});

describe('ContractFormClient — edit mode', () => {
	it('renders edit form title', () => {
		render(
			<Provider store={store}>
				<ContractFormClient id={1} />
			</Provider>,
		);
		expect(screen.getByText(/modifier le contrat/i)).toBeInTheDocument();
	});
});

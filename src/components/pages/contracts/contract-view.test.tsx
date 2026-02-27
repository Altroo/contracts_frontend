import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import ContractViewClient from './contract-view';

jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/utils/hooks', () => ({
	useToast: () => ({ onSuccess: jest.fn(), onError: jest.fn() }),
	useAppSelector: jest.fn(),
	usePermission: () => ({ is_staff: true, can_view: true, can_print: true, can_create: true, can_edit: true, can_delete: true }),
}));

jest.mock('@/store/services/contract', () => ({
	...jest.requireActual('@/store/services/contract'),
	useGetContractQuery: jest.fn(() => ({ data: undefined, isLoading: false })),
	useDeleteContractMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
	usePatchContractStatutMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}));

jest.mock('@/utils/routes', () => ({
	CONTRACTS_LIST: '/contracts',
	CONTRACTS_EDIT: (id: number) => `/contracts/${id}/edit`,
	CONTRACT_PDF: (id: number, language: string) => `/contract/pdf/${language}/${id}/`,
	CONTRACT_DOC: (id: number, language: string) => `/contract/doc/${language}/${id}/`,
}));

jest.mock('@/utils/apiHelpers', () => ({
	fetchFileBlob: jest.fn(),
}));

jest.mock('@/components/shared/pdfLanguageModal/pdfLanguageModal', () => {
	const Mock = () => <div data-testid="pdf-language-modal" />;
	Mock.displayName = 'PdfLanguageModal';
	return { __esModule: true, default: Mock };
});

jest.mock('@/components/formikElements/apiLoading/apiProgress/apiProgress', () => {
	const Mock = () => <div data-testid="api-progress" />;
	Mock.displayName = 'ApiProgress';
	return { __esModule: true, default: Mock };
});

jest.mock('@/components/layouts/navigationBar/navigationBar', () => {
	const Mock = ({ children }: { children: React.ReactNode }) => <div data-testid="navigation-bar">{children}</div>;
	Mock.displayName = 'NavigationBar';
	return { __esModule: true, default: Mock };
});

jest.mock('@/components/layouts/protected/protected', () => ({
	Protected: ({ children }: { children: React.ReactNode }) => <div data-testid="protected">{children}</div>,
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
		});
		render(
			<Provider store={store}>
				<ContractViewClient id={1} />
			</Provider>,
		);
		expect(screen.getAllByText('CTR-001').length).toBeGreaterThan(0);
		expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
	});

	it('renders modify and delete buttons', () => {
		const { useGetContractQuery } = jest.requireMock('@/store/services/contract');
		(useGetContractQuery as jest.Mock).mockReturnValue({
			data: {
				id: 1,
				numero_contrat: 'CTR-002',
				statut: 'Brouillon',
				date_contrat: '2024-02-01',
				client_nom: 'Alice Martin',
				montant_ht: 30000,
				devise: 'MAD',
			},
			isLoading: false,
		});
		render(
			<Provider store={store}>
				<ContractViewClient id={1} />
			</Provider>,
		);
		expect(screen.getByRole('button', { name: /modifier/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument();
	});

	it('renders PDF and DOCX buttons', () => {
		const { useGetContractQuery } = jest.requireMock('@/store/services/contract');
		(useGetContractQuery as jest.Mock).mockReturnValue({
			data: {
				id: 1,
				numero_contrat: 'CTR-003',
				statut: 'Signé',
				date_contrat: '2024-03-01',
				client_nom: 'Test Client',
				montant_ht: 10000,
				devise: 'MAD',
			},
			isLoading: false,
		});
		render(
			<Provider store={store}>
				<ContractViewClient id={1} />
			</Provider>,
		);
		expect(screen.getByRole('button', { name: /pdf/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /docx/i })).toBeInTheDocument();
	});
});

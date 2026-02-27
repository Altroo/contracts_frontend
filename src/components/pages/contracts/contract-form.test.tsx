import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { AppSession } from '@/types/_initTypes';

// Minimal mock store
const mockStore = configureStore({
	reducer: {
		_init: () => ({}),
		account: () => ({}),
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({ serializableCheck: false }),
});

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
	__esModule: true,
	useRouter: () => ({
		push: mockPush,
		back: jest.fn(),
		replace: jest.fn(),
		refresh: jest.fn(),
		forward: jest.fn(),
		prefetch: jest.fn(),
	}),
}));

// Mock hooks
jest.mock('@/utils/hooks', () => ({
	__esModule: true,
	useToast: () => ({ onSuccess: jest.fn(), onError: jest.fn() }),
}));

jest.mock('@/store/session', () => ({
	__esModule: true,
	getAccessTokenFromSession: () => 'mock-token',
}));

// Mock contract service hooks
const mockUseGetContractQuery = jest.fn();
const mockAddContractMutation = jest.fn();
const mockEditContractMutation = jest.fn();

jest.mock('@/store/services/contract', () => ({
	__esModule: true,
	useGetContractQuery: (params: { id: number }, options: { skip: boolean }) =>
		mockUseGetContractQuery(params, options),
	useAddContractMutation: () => [mockAddContractMutation, { isLoading: false, error: undefined }],
	useEditContractMutation: () => [mockEditContractMutation, { isLoading: false, error: undefined }],
}));

// Mock form sub-components
jest.mock('@/components/formikElements/customTextInput/customTextInput', () => ({
	__esModule: true,
	default: ({ id, label }: { id: string; label: string }) => (
		<div data-testid={`input-${id}`}>
			<label>{label}</label>
		</div>
	),
}));

jest.mock('@/components/formikElements/customDropDownSelect/customDropDownSelect', () => ({
	__esModule: true,
	default: ({ id, label }: { id: string; label: string }) => (
		<div data-testid={`dropdown-${id}`}>
			<label>{label}</label>
		</div>
	),
}));

jest.mock('@/components/htmlElements/buttons/primaryLoadingButton/primaryLoadingButton', () => ({
	__esModule: true,
	default: ({ buttonText, type }: { buttonText: string; type?: string }) => (
		<button data-testid="submit-button" type={type as 'submit' | 'button'}>
			{buttonText}
		</button>
	),
}));

jest.mock('@/components/formikElements/apiLoading/apiProgress/apiProgress', () => ({
	__esModule: true,
	default: () => <div data-testid="api-loader">Loading...</div>,
}));

jest.mock('@/components/formikElements/apiLoading/apiAlert/apiAlert', () => ({
	__esModule: true,
	default: () => <div data-testid="api-alert">Error</div>,
}));

jest.mock('@/utils/themes', () => ({
	textInputTheme: jest.fn(() => ({})),
	customDropdownTheme: jest.fn(() => ({})),
}));

jest.mock('@/utils/helpers', () => ({
	getLabelForKey: jest.fn((labels: Record<string, string>, key: string) => labels[key] || key),
	setFormikAutoErrors: jest.fn(),
}));

jest.mock('@/utils/rawData', () => ({
	contractStatutItemsList: ['Brouillon', 'En cours', 'Terminé'],
	typeContratItemsList: [
		{ code: 'travaux_finition', value: 'Travaux de finition' },
		{ code: 'amenagement', value: 'Aménagement' },
	],
	deviseItemsList: ['MAD', 'EUR', 'USD'],
	confidentialiteItemsList: ['CONFIDENTIEL', 'PUBLIC'],
}));

jest.mock('@/utils/formValidationSchemas', () => ({
	contractSchema: { parse: jest.fn() },
}));

jest.mock('zod-formik-adapter', () => ({
	toFormikValidationSchema: jest.fn(() => undefined),
}));

jest.mock('@/utils/routes', () => ({
	CONTRACTS_LIST: '/dashboard/contracts',
	CONTRACTS_VIEW: (id: number) => `/dashboard/contracts/${id}`,
}));

// Import after mocks
import ContractFormClient from './contract-form';

const mockSession: AppSession = {
	accessToken: 'mock-token',
	refreshToken: 'mock-refresh-token',
	accessTokenExpiration: '2099-12-31T23:59:59Z',
	refreshTokenExpiration: '2099-12-31T23:59:59Z',
	expires: '2099-12-31T23:59:59Z',
	user: {
		id: '1',
		pk: 1,
		email: 'test@example.com',
		emailVerified: null,
		name: 'Test User',
		first_name: 'Test',
		last_name: 'User',
	},
};

const renderWithProviders = (ui: React.ReactElement) => {
	return render(<Provider store={mockStore}>{ui}</Provider>);
};

describe('ContractFormClient', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUseGetContractQuery.mockReturnValue({
			data: undefined,
			isLoading: false,
			error: undefined,
		});
	});

	afterEach(() => {
		cleanup();
	});

	describe('Add Mode (no id)', () => {
		it('renders back button with list text', () => {
			renderWithProviders(<ContractFormClient session={mockSession} />);
			expect(screen.getByText('Liste des contrats')).toBeInTheDocument();
		});

		it('renders form fields', () => {
			renderWithProviders(<ContractFormClient session={mockSession} />);
			expect(screen.getByTestId('input-numero_contrat')).toBeInTheDocument();
			expect(screen.getByTestId('input-montant_ht')).toBeInTheDocument();
			expect(screen.getByTestId('input-client_nom')).toBeInTheDocument();
			expect(screen.getByTestId('dropdown-statut')).toBeInTheDocument();
			expect(screen.getByTestId('dropdown-devise')).toBeInTheDocument();
		});

		it('renders submit button with create text', () => {
			renderWithProviders(<ContractFormClient session={mockSession} />);
			expect(screen.getByTestId('submit-button')).toHaveTextContent('Créer le contrat');
		});

		it('renders section headers', () => {
			renderWithProviders(<ContractFormClient session={mockSession} />);
			expect(screen.getByText('Identification')).toBeInTheDocument();
			expect(screen.getByText('Client')).toBeInTheDocument();
			expect(screen.getByText('Travaux')).toBeInTheDocument();
			expect(screen.getByText('Financier')).toBeInTheDocument();
			expect(screen.getByText('Clauses')).toBeInTheDocument();
		});
	});

	describe('Edit Mode (with id)', () => {
		it('renders back button with return text', () => {
			mockUseGetContractQuery.mockReturnValue({
				data: {
					id: 1,
					numero_contrat: 'CTR-001',
					client_nom: 'Jean Dupont',
					montant_ht: '50000',
				},
				isLoading: false,
				error: undefined,
			});

			renderWithProviders(<ContractFormClient session={mockSession} id={1} />);
			expect(screen.getByText('Retour au contrat')).toBeInTheDocument();
		});

		it('renders submit button with update text', () => {
			mockUseGetContractQuery.mockReturnValue({
				data: { id: 1, numero_contrat: 'CTR-001', client_nom: 'Jean', montant_ht: '50000' },
				isLoading: false,
				error: undefined,
			});

			renderWithProviders(<ContractFormClient session={mockSession} id={1} />);
			expect(screen.getByTestId('submit-button')).toHaveTextContent('Mettre à jour');
		});
	});

	describe('Loading state', () => {
		it('shows loader when data is loading', () => {
			mockUseGetContractQuery.mockReturnValue({
				data: undefined,
				isLoading: true,
				error: undefined,
			});

			renderWithProviders(<ContractFormClient session={mockSession} id={1} />);
			expect(screen.getByTestId('api-loader')).toBeInTheDocument();
		});
	});

	describe('Hook calls', () => {
		it('calls useGetContractQuery when in edit mode', () => {
			renderWithProviders(<ContractFormClient session={mockSession} id={456} />);
			expect(mockUseGetContractQuery).toHaveBeenCalledWith({ id: 456 }, expect.any(Object));
		});

		it('calls useGetContractQuery with skip=true when not in edit mode', () => {
			renderWithProviders(<ContractFormClient session={mockSession} />);
			expect(mockUseGetContractQuery).toHaveBeenCalled();
		});
	});

	describe('Rich data rendering', () => {
		it('renders with API error in edit mode', () => {
			mockUseGetContractQuery.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: { status: 500, data: { message: 'Server Error' } },
			});
			renderWithProviders(<ContractFormClient session={mockSession} id={1} />);
			expect(screen.getByTestId('api-alert')).toBeInTheDocument();
		});

		it('renders edit mode with full contract data', () => {
			mockUseGetContractQuery.mockReturnValue({
				data: {
					id: 10,
					numero_contrat: 'CTR-010',
					date_contrat: '2024-01-01',
					statut: 'En cours',
					type_contrat: 'travaux_finition',
					ville_signature: 'Casablanca',
					client_nom: 'Jean Dupont',
					client_cin: 'AB123456',
					montant_ht: '75000',
					devise: 'MAD',
					tva: '20',
				},
				isLoading: false,
				error: undefined,
			});
			renderWithProviders(<ContractFormClient session={mockSession} id={10} />);
			expect(screen.getByText('Retour au contrat')).toBeInTheDocument();
		});

		it('handles add mutation loading state', () => {
			const contractService = jest.requireMock('@/store/services/contract') as {
				useAddContractMutation: () => [jest.Mock, { isLoading: boolean; error?: unknown }];
			};
			const mockMutate = jest.fn();
			contractService.useAddContractMutation = () => [mockMutate, { isLoading: true, error: undefined }];

			renderWithProviders(<ContractFormClient session={mockSession} />);
			expect(screen.getByTestId('api-loader')).toBeInTheDocument();
		});

		it('handles edit mutation loading state', () => {
			const contractService = jest.requireMock('@/store/services/contract') as {
				useEditContractMutation: () => [jest.Mock, { isLoading: boolean; error?: unknown }];
			};
			const mockMutate = jest.fn();
			contractService.useEditContractMutation = () => [mockMutate, { isLoading: true, error: undefined }];

			mockUseGetContractQuery.mockReturnValue({
				data: { id: 1, numero_contrat: 'CTR-001', client_nom: 'Test', montant_ht: '100' },
				isLoading: false,
				error: undefined,
			});

			renderWithProviders(<ContractFormClient session={mockSession} id={1} />);
			expect(screen.getByTestId('api-loader')).toBeInTheDocument();
		});
	});
});

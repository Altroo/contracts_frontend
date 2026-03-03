import React from 'react';
import { render, screen, cleanup, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
	useRouter: () => ({
		push: mockPush,
		back: jest.fn(),
		forward: jest.fn(),
		refresh: jest.fn(),
		replace: jest.fn(),
		prefetch: jest.fn(),
	}),
}));

// Mock session helper
jest.mock('@/store/session', () => ({
	getAccessTokenFromSession: jest.fn(() => 'mock-token'),
}));

// Mock toast hook
const mockOnSuccess = jest.fn();
const mockOnError = jest.fn();
jest.mock('@/utils/hooks', () => ({
	useToast: () => ({ onSuccess: mockOnSuccess, onError: mockOnError }),
}));

// Mock RTK Query hooks
const mockRefetch = jest.fn();
const mockDeleteContract = jest.fn(() => ({ unwrap: () => Promise.resolve() }));

const mockUseGetContractsListQuery = jest.fn(() => ({
	data: {
		results: [
			{
				id: 1,
				numero_contrat: 'CTR-001',
				client_nom: 'Ali Ben',
				type_contrat_display: 'Travaux de finition',
				statut: 'Brouillon',
				date_contrat: '2024-01-15',
				montant_ht: 10000,
				devise: 'MAD',
			},
			{
				id: 2,
				numero_contrat: 'CTR-002',
				client_nom: null,
				type_contrat_display: 'Gros œuvre',
				statut: 'Signé',
				date_contrat: null,
				montant_ht: null,
				devise: 'EUR',
			},
		],
		count: 2,
		next: null,
		previous: null,
	},
	isLoading: false,
	refetch: mockRefetch,
}));

const mockBulkDeleteContracts = jest.fn();

jest.mock('@/store/services/contract', () => ({
	useGetContractsListQuery: () => mockUseGetContractsListQuery(),
	useDeleteContractMutation: jest.fn(() => [mockDeleteContract, { isLoading: false }]),
	useBulkDeleteContractsMutation: jest.fn(() => [mockBulkDeleteContracts, { isLoading: false }]),
}));

// Mock routes
jest.mock('@/utils/routes', () => ({
	CONTRACTS_ADD: '/contracts/new',
	CONTRACTS_VIEW: (id: number) => `/contracts/${id}`,
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

// Enhanced PaginatedDataGrid mock that calls renderCell
jest.mock('@/components/shared/paginatedDataGrid/paginatedDataGrid', () => ({
	__esModule: true,
	default: ({
		columns,
		data,
	}: {
		columns: Array<{
			field: string;
			headerName: string;
			renderCell?: (params: { value: unknown; row: Record<string, unknown>; field: string }) => React.ReactNode;
		}>;
		data?: { results?: Array<Record<string, unknown>> };
		isLoading?: boolean;
		onCustomFilterParamsChange?: (params: Record<string, string>) => void;
	}) => {
		const results = data?.results || [];
		return (
			<div data-testid="paginated-data-grid">
				<table>
					<thead>
						<tr>
							{columns.map((col) => (
								<th key={col.field}>{col.headerName}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{results.map((row) => (
							<tr key={row.id as number} data-testid={`row-${row.id}`}>
								{columns.map((col) => (
									<td key={col.field}>
										{col.renderCell
											? col.renderCell({ value: row[col.field], row, field: col.field })
											: String(row[col.field] ?? '')}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	},
}));

// Mock Protected
jest.mock('@/components/layouts/protected/protected', () => ({
	Protected: ({ children }: { children: React.ReactNode }) => <div data-testid="protected">{children}</div>,
}));

// Mock NavigationBar
jest.mock('@/components/layouts/navigationBar/navigationBar', () => {
	const Mock = ({ children }: { children: React.ReactNode }) => <div data-testid="navigation-bar">{children}</div>;
	Mock.displayName = 'NavigationBar';
	return { __esModule: true, default: Mock };
});

// Mock ActionModals
jest.mock('@/components/htmlElements/modals/actionModal/actionModals', () => ({
	__esModule: true,
	default: ({
		title,
		body,
		actions,
	}: {
		title: string;
		body: string;
		actions: Array<{ text: string; onClick: () => void }>;
	}) => (
		<div data-testid="action-modal" role="dialog">
			<h2>{title}</h2>
			<p>{body}</p>
			<div>
				{actions.map((action) => (
					<button key={action.text} onClick={action.onClick}>
						{action.text}
					</button>
				))}
			</div>
		</div>
	),
}));

// Mock MobileActionsMenu
jest.mock('@/components/shared/mobileActionsMenu/mobileActionsMenu', () => ({
	__esModule: true,
	default: ({ actions }: { actions: Array<{ label: string; onClick: () => void }> }) => (
		<div data-testid="mobile-actions-menu">
			{actions.map((a) => (
				<button key={a.label} onClick={a.onClick}>
					{a.label}
				</button>
			))}
		</div>
	),
}));

jest.mock('@/components/htmlElements/tooltip/darkTooltip/darkTooltip', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/shared/dropdownFilter/dropdownFilter', () => ({
	createDropdownFilterOperators: jest.fn(() => []),
}));

jest.mock('@/components/shared/dateRangeFilter/dateRangeFilterOperator', () => ({
	createDateRangeFilterOperator: jest.fn(() => []),
}));

jest.mock('@/components/shared/numericFilter/numericFilterOperator', () => ({
	createNumericFilterOperators: jest.fn(() => []),
}));

jest.mock('@/components/shared/chipSelectFilter/chipSelectFilterBar', () => ({
	__esModule: true,
	default: () => <div data-testid="chip-filter-bar" />,
}));

jest.mock('@/components/formikElements/apiLoading/apiProgress/apiProgress', () => ({
	__esModule: true,
	default: () => <div data-testid="api-progress" />,
}));

jest.mock('@/utils/helpers', () => ({
	formatDate: (date: string | null) => (date ? new Date(date).toLocaleDateString('fr-FR') : '—'),
	extractApiErrorMessage: (error: unknown, fallback: string) => fallback,
	normalizeStatut: (statut: string) => statut,
	hexToRGB: (hex: string, alpha?: number) => (alpha !== undefined ? `rgba(0,0,0,${alpha})` : 'rgb(0,0,0)'),
}));

jest.mock('@/utils/rawData', () => ({
	getContractStatusColor: (statut: string) => {
		const map: Record<string, string> = {
			Brouillon: 'default',
			'En cours': 'warning',
		};
		return map[statut] ?? 'default';
	},
	contractStatutItemsList: ['Brouillon', 'Envoyé', 'Signé', 'En cours', 'Terminé', 'Annulé', 'Expiré'],
	companyItemsList: [
		{ code: 'casa_di_lusso', value: 'Casa di Lusso' },
		{ code: 'blueline_works', value: 'Blueline Works' },
	],
}));

jest.mock('@/styles/dashboard/dashboard.module.sass', () => ({
	flexRootStack: 'flexRootStack',
}));

import ContractsListClient from './contracts-list';

const mockSession = {
	user: { name: 'Test', email: 'test@test.com' },
	expires: '2099-01-01',
	accessToken: 'mock-token',
};

describe('ContractsListClient', () => {
	beforeEach(() => jest.clearAllMocks());
	afterEach(() => cleanup());

	describe('Rendering', () => {
		it('renders paginated data grid', () => {
			render(<ContractsListClient session={mockSession} />);
			expect(screen.getByTestId('paginated-data-grid')).toBeInTheDocument();
		});

		it('renders Nouveau contrat button', () => {
			render(<ContractsListClient session={mockSession} />);
			expect(screen.getByText('Nouveau contrat')).toBeInTheDocument();
		});

		it('renders data rows', () => {
			render(<ContractsListClient session={mockSession} />);
			expect(screen.getByTestId('row-1')).toBeInTheDocument();
			expect(screen.getByTestId('row-2')).toBeInTheDocument();
		});
	});

	describe('Column renderCell', () => {
		it('renders numero_contrat values', () => {
			render(<ContractsListClient session={mockSession} />);
			expect(screen.getByText('CTR-001')).toBeInTheDocument();
			expect(screen.getByText('CTR-002')).toBeInTheDocument();
		});

		it('renders client_nom with null showing dash', () => {
			render(<ContractsListClient session={mockSession} />);
			expect(screen.getByText('Ali Ben')).toBeInTheDocument();
			// null client_nom renders as "—"
			const dashes = screen.getAllByText('—');
			expect(dashes.length).toBeGreaterThan(0);
		});

		it('renders type_contrat_display values', () => {
			render(<ContractsListClient session={mockSession} />);
			expect(screen.getByText('Travaux de finition')).toBeInTheDocument();
			expect(screen.getByText('Gros œuvre')).toBeInTheDocument();
		});

		it('renders statut as Chip text', () => {
			render(<ContractsListClient session={mockSession} />);
			expect(screen.getByText('Brouillon')).toBeInTheDocument();
			expect(screen.getByText('Signé')).toBeInTheDocument();
		});

		it('renders date_contrat with null showing dash', () => {
			render(<ContractsListClient session={mockSession} />);
			// formatDate('2024-01-15') → localized date; formatDate(null) → '—'
			const dashes = screen.getAllByText('—');
			expect(dashes.length).toBeGreaterThanOrEqual(1);
		});

		it('renders montant_ht with devise or dash for null', () => {
			render(<ContractsListClient session={mockSession} />);
			// null montant_ht → '—'
			const dashes = screen.getAllByText('—');
			expect(dashes.length).toBeGreaterThanOrEqual(1);
		});

		it('renders action buttons for each row', () => {
			render(<ContractsListClient session={mockSession} />);
			expect(screen.getAllByText('Voir').length).toBeGreaterThanOrEqual(2);
			expect(screen.getAllByText('Modifier').length).toBeGreaterThanOrEqual(2);
			expect(screen.getAllByText('Supprimer').length).toBeGreaterThanOrEqual(2);
		});
	});

	describe('Action handlers', () => {
		it('navigates to add page', () => {
			render(<ContractsListClient session={mockSession} />);
			fireEvent.click(screen.getByText('Nouveau contrat'));
			expect(mockPush).toHaveBeenCalledWith('/contracts/new');
		});

		it('navigates to view page', () => {
			render(<ContractsListClient session={mockSession} />);
			fireEvent.click(screen.getAllByText('Voir')[0]);
			expect(mockPush).toHaveBeenCalledWith('/contracts/1');
		});

		it('navigates to edit page', () => {
			render(<ContractsListClient session={mockSession} />);
			fireEvent.click(screen.getAllByText('Modifier')[0]);
			expect(mockPush).toHaveBeenCalledWith('/contracts/1/edit');
		});

		it('opens delete modal', async () => {
			render(<ContractsListClient session={mockSession} />);
			await act(async () => { fireEvent.click(screen.getAllByText('Supprimer')[0]); });
			expect(screen.getByTestId('action-modal')).toBeInTheDocument();
			expect(screen.getByText('Supprimer ce contrat ?')).toBeInTheDocument();
		});

		it('closes delete modal on Annuler', async () => {
			render(<ContractsListClient session={mockSession} />);
			await act(async () => { fireEvent.click(screen.getAllByText('Supprimer')[0]); });
			await act(async () => { fireEvent.click(screen.getByText('Annuler')); });
			expect(screen.queryByTestId('action-modal')).not.toBeInTheDocument();
		});

		it('deletes contract on confirm', async () => {
			render(<ContractsListClient session={mockSession} />);
			await act(async () => { fireEvent.click(screen.getAllByText('Supprimer')[0]); });
			const btns = screen.getAllByText('Supprimer');
			await act(async () => { fireEvent.click(btns[btns.length - 1]); });
			await waitFor(() => {
				expect(mockDeleteContract).toHaveBeenCalled();
				expect(mockOnSuccess).toHaveBeenCalledWith('Contrat supprimé avec succès');
			});
		});

		it('handles delete error', async () => {
			mockDeleteContract.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('fail')) });
			render(<ContractsListClient session={mockSession} />);
			await act(async () => { fireEvent.click(screen.getAllByText('Supprimer')[0]); });
			const btns = screen.getAllByText('Supprimer');
			await act(async () => { fireEvent.click(btns[btns.length - 1]); });
			await waitFor(() => {
				expect(mockOnError).toHaveBeenCalledWith('Erreur lors de la suppression du contrat');
			});
		});
	});

	describe('Column headers', () => {
		it('renders all expected column headers', () => {
			render(<ContractsListClient session={mockSession} />);
			for (const h of ['Référence', 'Client', 'Type de contrat', 'Statut', 'Date du contrat', 'Montant HT', 'Actions']) {
				expect(screen.getByText(h)).toBeInTheDocument();
			}
		});
	});

	describe('Loading and empty states', () => {
		it('renders grid when loading', () => {
			mockUseGetContractsListQuery.mockReturnValueOnce({ data: { results: [], count: 0, next: null, previous: null }, isLoading: true, refetch: mockRefetch });
			render(<ContractsListClient session={mockSession} />);
			expect(screen.getByTestId('paginated-data-grid')).toBeInTheDocument();
		});

		it('renders grid when empty', () => {
			mockUseGetContractsListQuery.mockReturnValueOnce({ data: { results: [], count: 0, next: null, previous: null }, isLoading: false, refetch: mockRefetch });
			render(<ContractsListClient session={mockSession} />);
			expect(screen.getByTestId('paginated-data-grid')).toBeInTheDocument();
		});
	});
});

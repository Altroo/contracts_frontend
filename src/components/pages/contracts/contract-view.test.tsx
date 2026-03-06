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

	describe('Sous-Traitance (ST) contract view', () => {
		const stContract = {
			id: 50,
			company: 'casa_di_lusso',
			contract_category: 'sous_traitance',
			contract_category_display: 'Sous-Traitance',
			numero_contrat: 'CTR-ST-050',
			date_contrat: '2024-06-01',
			statut: 'Brouillon',
			type_contrat: 'travaux_finition',
			ville_signature: 'Tanger',
			client_nom: 'Client ST View',
			client_cin: 'ST-CIN-001',
			montant_ht: 120000,
			devise: 'MAD',
			tva: 20,
			st_name: 'Sous-Traitant Alpha',
			st_forme: 'SARL',
			st_capital: '500000',
			st_rc: 'RC-12345',
			st_ice: 'ICE-67890',
			st_if: 'IF-11111',
			st_cnss: 'CNSS-22222',
			st_addr: '123 Rue des ST',
			st_rep: 'Mohamed Alami',
			st_cin: 'AB123456',
			st_qualite: 'Gérant',
			st_tel: '0612345678',
			st_email: 'st@example.com',
			st_rib: '123456789012345678901234',
			st_banque: 'Banque Populaire',
			st_lot_type: 'gros_oeuvre',
			st_lot_description: 'Gros œuvre complet',
			st_type_prix: 'forfaitaire',
			st_retenue_garantie: 10,
			st_avance: 15,
			st_penalite_taux: 0.5,
			st_plafond_penalite: 10,
			st_delai_paiement: 30,
			st_tranches: [
				{ label: 'Démarrage', pourcentage: 30 },
				{ label: 'Mi-parcours', pourcentage: 40 },
				{ label: 'Réception', pourcentage: 30 },
			],
			st_delai_val: 6,
			st_delai_unit: 'mois',
			st_garantie_mois: 12,
			st_delai_reserves: 30,
			st_delai_med: 30,
			st_clauses_actives: ['tConfid', 'tNonConc'],
			st_observations: 'Observations de test pour ST',
			st_projet_detail: { id: 1, name: 'Projet Résidence Alpha' },
		};

		beforeEach(() => {
			const { useGetContractQuery } = jest.requireMock('@/store/services/contract');
			(useGetContractQuery as jest.Mock).mockReturnValue({
				data: stContract,
				isLoading: false,
			});
		});

		it('renders ST section headers', () => {
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			expect(screen.getByText('Sous-Traitant')).toBeInTheDocument();
			expect(screen.getByText('Lot & Type')).toBeInTheDocument();
			expect(screen.getByText('Financier ST')).toBeInTheDocument();
			expect(screen.getByText('Échéancier ST')).toBeInTheDocument();
			expect(screen.getByText('Délais & Garantie ST')).toBeInTheDocument();
			expect(screen.getByText('Clauses actives ST')).toBeInTheDocument();
			expect(screen.getByText('Observations')).toBeInTheDocument();
		});

		it('renders category chip with Sous-Traitance label', () => {
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			expect(screen.getByText('Sous-Traitance')).toBeInTheDocument();
		});

		it('renders Sous-Traitant identity details', () => {
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			expect(screen.getByText('Sous-Traitant Alpha')).toBeInTheDocument();
			expect(screen.getByText('SARL')).toBeInTheDocument();
			expect(screen.getByText('500000')).toBeInTheDocument();
			expect(screen.getByText('RC-12345')).toBeInTheDocument();
			expect(screen.getByText('ICE-67890')).toBeInTheDocument();
			expect(screen.getByText('IF-11111')).toBeInTheDocument();
			expect(screen.getByText('CNSS-22222')).toBeInTheDocument();
			expect(screen.getByText('123 Rue des ST')).toBeInTheDocument();
			expect(screen.getByText('Mohamed Alami')).toBeInTheDocument();
			expect(screen.getByText('AB123456')).toBeInTheDocument();
			expect(screen.getByText('Gérant')).toBeInTheDocument();
			expect(screen.getByText('0612345678')).toBeInTheDocument();
			expect(screen.getByText('st@example.com')).toBeInTheDocument();
			expect(screen.getByText('123456789012345678901234')).toBeInTheDocument();
			expect(screen.getByText('Banque Populaire')).toBeInTheDocument();
		});

		it('renders project detail when st_projet_detail exists', () => {
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			expect(screen.getByText('Projet Résidence Alpha')).toBeInTheDocument();
		});

		it('renders Lot & Type resolved labels', () => {
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			expect(screen.getByText('Travaux de Gros Œuvre')).toBeInTheDocument();
			expect(screen.getByText('Gros œuvre complet')).toBeInTheDocument();
			expect(screen.getByText('Forfaitaire ferme')).toBeInTheDocument();
		});

		it('renders Financier ST values with percentage formatting', () => {
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			// 10% appears twice: retenue_garantie and plafond_penalite
			expect(screen.getAllByText('10%').length).toBe(2);
			expect(screen.getByText('15%')).toBeInTheDocument();
			expect(screen.getByText('0.5‰/jour')).toBeInTheDocument();
			// "30 jours" appears in both Financier (délai paiement) and Délais (réserves)
			expect(screen.getAllByText('30 jours').length).toBeGreaterThanOrEqual(2);
		});

		it('renders Échéancier ST tranches table', () => {
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			expect(screen.getByText('Démarrage')).toBeInTheDocument();
			expect(screen.getByText('Mi-parcours')).toBeInTheDocument();
			expect(screen.getByText('Réception')).toBeInTheDocument();
			// 30% appears twice: tranche Démarrage (30%) and tranche Réception (30%)
			expect(screen.getAllByText('30%').length).toBe(2);
			expect(screen.getByText('40%')).toBeInTheDocument();
		});

		it('renders Délais & Garantie ST values', () => {
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			expect(screen.getByText('6 Mois')).toBeInTheDocument();
			expect(screen.getByText('12 mois')).toBeInTheDocument();
		});

		it('renders clause chips from st_clauses_actives', () => {
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			// "Confidentialité" also appears as common InfoRow label
			expect(screen.getAllByText('Confidentialité').length).toBeGreaterThanOrEqual(2);
			expect(screen.getByText('Non-concurrence')).toBeInTheDocument();
		});

		it('renders observations text', () => {
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			expect(screen.getByText('Observations de test pour ST')).toBeInTheDocument();
		});

		it('does not render CDL-specific sections in ST view', () => {
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			expect(screen.queryByText('Services CDL')).not.toBeInTheDocument();
			expect(screen.queryByText('Projet CDL')).not.toBeInTheDocument();
			expect(screen.queryByText('Clauses actives CDL')).not.toBeInTheDocument();
			expect(screen.queryByText('Détails additionnels CDL')).not.toBeInTheDocument();
		});

		it('does not render Blueline-specific sections in ST view', () => {
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			expect(screen.queryByText('Client (Blueline)')).not.toBeInTheDocument();
			expect(screen.queryByText('Garantie (Blueline)')).not.toBeInTheDocument();
		});

		it('hides Échéancier ST when st_tranches is empty', () => {
			const { useGetContractQuery } = jest.requireMock('@/store/services/contract');
			(useGetContractQuery as jest.Mock).mockReturnValue({
				data: { ...stContract, st_tranches: [] },
				isLoading: false,
			});
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			expect(screen.queryByText('Échéancier ST')).not.toBeInTheDocument();
		});

		it('hides Clauses actives ST when st_clauses_actives is empty', () => {
			const { useGetContractQuery } = jest.requireMock('@/store/services/contract');
			(useGetContractQuery as jest.Mock).mockReturnValue({
				data: { ...stContract, st_clauses_actives: [] },
				isLoading: false,
			});
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			expect(screen.queryByText('Clauses actives ST')).not.toBeInTheDocument();
		});

		it('hides Observations when st_observations is empty', () => {
			const { useGetContractQuery } = jest.requireMock('@/store/services/contract');
			(useGetContractQuery as jest.Mock).mockReturnValue({
				data: { ...stContract, st_observations: '' },
				isLoading: false,
			});
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			const observationsHeaders = screen.queryAllByText('Observations');
			expect(observationsHeaders.length).toBe(0);
		});

		it('renders InfoRow labels in ST sections', () => {
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			// Unique ST labels
			expect(screen.getByText('Raison sociale')).toBeInTheDocument();
			expect(screen.getByText('Forme juridique')).toBeInTheDocument();
			expect(screen.getByText('Capital')).toBeInTheDocument();
			expect(screen.getByText('RC')).toBeInTheDocument();
			expect(screen.getByText('ICE')).toBeInTheDocument();
			expect(screen.getByText('IF')).toBeInTheDocument();
			expect(screen.getByText('CNSS')).toBeInTheDocument();
			expect(screen.getByText('Représentant')).toBeInTheDocument();
			expect(screen.getByText('Type de lot')).toBeInTheDocument();
			expect(screen.getByText('Description du lot')).toBeInTheDocument();
			expect(screen.getByText('Type de prix')).toBeInTheDocument();
			expect(screen.getByText('Retenue de garantie')).toBeInTheDocument();
			expect(screen.getByText('Avance')).toBeInTheDocument();
			expect(screen.getByText('Taux de pénalité')).toBeInTheDocument();
			expect(screen.getByText('Plafond pénalité')).toBeInTheDocument();
			expect(screen.getByText('Délai de paiement')).toBeInTheDocument();
			expect(screen.getByText("Délai d'exécution")).toBeInTheDocument();
			expect(screen.getByText('Délai levée réserves')).toBeInTheDocument();
			expect(screen.getByText('Délai médiation')).toBeInTheDocument();
			// Labels shared between common & ST sections (appear twice)
			expect(screen.getAllByText('Adresse').length).toBeGreaterThanOrEqual(2);
			expect(screen.getAllByText('Qualité').length).toBeGreaterThanOrEqual(2);
			expect(screen.getAllByText('Téléphone').length).toBeGreaterThanOrEqual(2);
			expect(screen.getAllByText('Email').length).toBeGreaterThanOrEqual(2);
			expect(screen.getAllByText('Garantie').length).toBeGreaterThanOrEqual(2);
		});

		it('renders tranches table headers', () => {
			render(
				<Provider store={store}>
					<ContractViewClient id={50} />
				</Provider>,
			);
			expect(screen.getByText('Tranche')).toBeInTheDocument();
			expect(screen.getByText('Pourcentage')).toBeInTheDocument();
		});
	});
});

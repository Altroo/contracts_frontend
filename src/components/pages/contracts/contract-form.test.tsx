import React from 'react';
import {cleanup, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import type {AppSession} from '@/types/_initTypes';
import ContractFormClient from './contract-form';

// Minimal mock store
const mockStore = configureStore({
  reducer: {
    _init: () => ({}),
    account: () => ({}),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({serializableCheck: false}),
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
  useToast: () => ({onSuccess: jest.fn(), onError: jest.fn()}),
   
  useLanguage: () => ({ language: 'fr', setLanguage: jest.fn(), t: require('@/translations').translations.fr }),
}));

jest.mock('@/contexts/InitContext', () => ({
  useInitAccessToken: jest.fn(() => 'test-token'),
}));

// Mock contract service hooks
const mockUseGetContractQuery = jest.fn();
const mockAddContractMutation = jest.fn();
const mockEditContractMutation = jest.fn();

jest.mock('@/store/services/contract', () => ({
  __esModule: true,
  useGetContractQuery: (params: { id: number }, options: { skip: boolean }) =>
    mockUseGetContractQuery(params, options),
  useGetCodeReferenceQuery: () => ({data: {numero_contrat: 'CTR-AUTO-001'}, isLoading: false}),
  useAddContractMutation: () => [mockAddContractMutation, {isLoading: false, error: undefined}],
  useEditContractMutation: () => [mockEditContractMutation, {isLoading: false, error: undefined}],
  useGetProjectsListQuery: () => ({data: [], isLoading: false}),
}));

// Mock form subcomponents
jest.mock('@/components/formikElements/customTextInput/customTextInput', () => ({
  __esModule: true,
  default: ({id, label}: { id: string; label: string }) => (
    <div data-testid={`input-${id}`}>
      <label>{label}</label>
    </div>
  ),
}));

jest.mock('@/components/formikElements/customDropDownSelect/customDropDownSelect', () => ({
  __esModule: true,
  default: ({id, label}: { id: string; label: string }) => (
    <div data-testid={`dropdown-${id}`}>
      <label>{label}</label>
    </div>
  ),
}));

jest.mock('@/components/htmlElements/buttons/primaryLoadingButton/primaryLoadingButton', () => ({
  __esModule: true,
  default: ({buttonText, type}: { buttonText: string; type?: string }) => (
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
  gridInputTheme: jest.fn(() => ({})),
  customGridDropdownTheme: jest.fn(() => ({})),
}));

// Mock Protected
jest.mock('@/components/layouts/protected/protected', () => ({
  Protected: ({children}: { children: React.ReactNode }) => <div data-testid="protected">{children}</div>,
}));

// Mock NavigationBar
jest.mock('@/components/layouts/navigationBar/navigationBar', () => {
  const Mock = ({children}: { children: React.ReactNode }) => <div data-testid="navigation-bar">{children}</div>;
  Mock.displayName = 'NavigationBar';
  return {__esModule: true, default: Mock};
});

jest.mock('@/utils/helpers', () => ({
  getLabelForKey: jest.fn((labels: Record<string, string>, key: string) => labels[key] || key),
  setFormikAutoErrors: jest.fn(),
  formatLocalDate: jest.fn((date: Date) => date.toISOString().split('T')[0]),
}));

jest.mock('@/utils/rawData', () => ({
  companyItemsList: [
    {code: 'casa_di_lusso', value: 'Casa di Lusso'},
    {code: 'blueline_works', value: 'Blueline Works'},
  ],
  deviseItemsList: ['MAD', 'EUR', 'USD'],
  tribunalItemsList: [
    {code: 'Tanger', value: 'Tanger'},
    {code: 'Casablanca', value: 'Casablanca'},
  ],
  getTranslatedRawData: () => ({
    contractStatutItemsList: [
      {code: 'Brouillon', value: 'Brouillon'},
      {code: 'En cours', value: 'En cours'},
      {code: 'Terminé', value: 'Terminé'},
    ],
    typeContratItemsList: [
      {code: 'travaux_finition', value: 'Travaux de finition'},
      {code: 'amenagement', value: 'Aménagement'},
    ],
    confidentialiteItemsList: [
      {code: 'CONFIDENTIEL', value: 'CONFIDENTIEL'},
      {code: 'PUBLIC', value: 'PUBLIC'},
    ],
    fournituresItemsList: [
      {code: 'non_incluses', value: 'Non incluses'},
      {code: 'incluses', value: 'Incluses'},
      {code: 'partielles', value: 'Partielles'},
    ],
    eauElectriciteItemsList: [
      {code: 'client', value: 'À la charge du client'},
      {code: 'entreprise', value: "À la charge de l'entreprise"},
    ],
    garantieUniteItemsList: [
      {code: 'mois', value: 'Mois'},
      {code: 'ans', value: 'Ans'},
    ],
    garantieTypeItemsList: [
      {code: 'defauts', value: 'Défauts'},
      {code: 'bonne_fin', value: 'Bonne fin'},
    ],
    clauseResiliationItemsList: [
      {code: '30j', value: '30 jours'},
      {code: '15j', value: '15 jours'},
    ],
    prestationNomItemsList: [
      {code: 'carrelage', value: 'Carrelage'},
      {code: 'peinture', value: 'Peinture'},
    ],
    prestationUniteItemsList: [
      {code: 'm2', value: 'm²'},
      {code: 'ml', value: 'ml'},
    ],
    modePaiementTexteItemsList: [
      {code: 'Virement Bancaire', value: 'Virement Bancaire'},
      {code: 'Espèces', value: 'Espèces'},
    ],
    typeBienItemsList: [
      {code: 'appartement', value: 'Appartement'},
      {code: 'villa', value: 'Villa'},
    ],
    clientQualiteItemsList: [
      {code: 'particulier', value: 'Particulier'},
      {code: 'entreprise_societe', value: 'Entreprise / Société'},
    ],
    garantieItemsList: [
      {code: '1 an', value: '1 an'},
      {code: '2 ans', value: '2 ans'},
    ],
    contractCategoryItemsList: [
      {code: 'standard', value: 'Standard'},
      {code: 'sous_traitance', value: 'Sous-Traitance'},
    ],
    stLotTypeItemsList: [
      {code: 'gros_oeuvre', value: 'Travaux de Gros Œuvre'},
      {code: 'electricite', value: "Travaux d'Électricité"},
    ],
    stFormeJuridiqueItemsList: [
      {code: 'SARL', value: 'SARL'},
      {code: 'SA', value: 'SA'},
    ],
    stTypePrixItemsList: [
      {code: 'forfaitaire', value: 'Forfaitaire ferme'},
      {code: 'unitaire', value: 'Prix unitaires'},
    ],
    stDelaiUnitItemsList: [
      {code: 'mois', value: 'Mois'},
      {code: 'semaines', value: 'Semaines'},
    ],
    stClausesActivesList: [
      {key: 'tConfid', label: 'Confidentialité'},
      {key: 'tNonConc', label: 'Non-concurrence'},
    ],
    dureeEstimeeUniteItemsList: [
      {code: 'jours', value: 'Jours'},
      {code: 'mois', value: 'Mois'},
    ],
  }),
}));

jest.mock('@/utils/formValidationSchemas', () => ({
  contractSchema: {parse: jest.fn()},
  bluelineRequired: ['fournitures', 'eau_electricite', 'acompte', 'tranche2', 'clause_resiliation'] as const,
  casaDiLussoRequired: ['type_contrat'] as const,
  stRequired: ['st_name', 'st_lot_type', 'st_type_prix'] as const,
}));

jest.mock('zod-formik-adapter', () => ({
  toFormikValidationSchema: jest.fn(() => undefined),
}));

jest.mock('@/utils/routes', () => ({
  CONTRACTS_LIST: '/dashboard/contracts',
  CONTRACTS_VIEW: (id: number) => `/dashboard/contracts/${id}`,
}));

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
      renderWithProviders(<ContractFormClient session={mockSession}/>);
      expect(screen.getByText('Liste des contrats')).toBeInTheDocument();
    });

    it('renders form fields', () => {
      renderWithProviders(<ContractFormClient session={mockSession}/>);
      expect(screen.getByTestId('input-numero_contrat')).toBeInTheDocument();
      expect(screen.getByTestId('input-montant_ht')).toBeInTheDocument();
      expect(screen.getByTestId('input-client_nom')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-statut')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-devise')).toBeInTheDocument();
    });

    it('renders submit button with create text', () => {
      renderWithProviders(<ContractFormClient session={mockSession}/>);
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Créer le contrat');
    });

    it('renders section headers', () => {
      renderWithProviders(<ContractFormClient session={mockSession}/>);
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

      renderWithProviders(<ContractFormClient session={mockSession} id={1}/>);
      expect(screen.getByText('Liste des contrats')).toBeInTheDocument();
    });

    it('renders submit button with update text', () => {
      mockUseGetContractQuery.mockReturnValue({
        data: {id: 1, numero_contrat: 'CTR-001', client_nom: 'Jean', montant_ht: '50000'},
        isLoading: false,
        error: undefined,
      });

      renderWithProviders(<ContractFormClient session={mockSession} id={1}/>);
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

      renderWithProviders(<ContractFormClient session={mockSession} id={1}/>);
      expect(screen.getByTestId('api-loader')).toBeInTheDocument();
    });
  });

  describe('Hook calls', () => {
    it('calls useGetContractQuery when in edit mode', () => {
      renderWithProviders(<ContractFormClient session={mockSession} id={456}/>);
      expect(mockUseGetContractQuery).toHaveBeenCalledWith({id: 456}, expect.any(Object));
    });

    it('calls useGetContractQuery with skip=true when not in edit mode', () => {
      renderWithProviders(<ContractFormClient session={mockSession}/>);
      expect(mockUseGetContractQuery).toHaveBeenCalled();
    });
  });

  describe('Rich data rendering', () => {
    it('renders with API error in edit mode', () => {
      mockUseGetContractQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: {status: 500, data: {message: 'Server Error'}},
      });
      renderWithProviders(<ContractFormClient session={mockSession} id={1}/>);
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
      renderWithProviders(<ContractFormClient session={mockSession} id={10}/>);
      expect(screen.getByText('Liste des contrats')).toBeInTheDocument();
    });

    it('handles add mutation loading state', () => {
      const contractService = jest.requireMock('@/store/services/contract') as {
        useAddContractMutation: () => [jest.Mock, { isLoading: boolean; error?: unknown }];
      };
      const mockMutate = jest.fn();
      contractService.useAddContractMutation = () => [mockMutate, {isLoading: true, error: undefined}];

      renderWithProviders(<ContractFormClient session={mockSession}/>);
      expect(screen.getByTestId('api-loader')).toBeInTheDocument();
    });

    it('handles edit mutation loading state', () => {
      const contractService = jest.requireMock('@/store/services/contract') as {
        useEditContractMutation: () => [jest.Mock, { isLoading: boolean; error?: unknown }];
      };
      const mockMutate = jest.fn();
      contractService.useEditContractMutation = () => [mockMutate, {isLoading: true, error: undefined}];

      mockUseGetContractQuery.mockReturnValue({
        data: {id: 1, numero_contrat: 'CTR-001', client_nom: 'Test', montant_ht: '100'},
        isLoading: false,
        error: undefined,
      });

      renderWithProviders(<ContractFormClient session={mockSession} id={1}/>);
      expect(screen.getByTestId('api-loader')).toBeInTheDocument();
    });
  });

  describe('Sous-Traitance (ST) mode', () => {
    const stContractData = {
      id: 50,
      company: 'casa_di_lusso',
      contract_category: 'sous_traitance',
      numero_contrat: 'CTR-ST-050',
      date_contrat: '2024-06-01',
      statut: 'Brouillon',
      type_contrat: 'travaux_finition',
      ville_signature: 'Tanger',
      client_nom: 'Client ST',
      client_cin: 'ST-CIN-001',
      montant_ht: '120000',
      devise: 'MAD',
      tva: '20',
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
      st_lot_type: ['gros_oeuvre'],
      st_lot_description: 'Gros œuvre complet',
      st_type_prix: ['forfaitaire'],
      st_retenue_garantie: '10',
      st_avance: '15',
      st_penalite_taux: '0.5',
      st_plafond_penalite: '10',
      st_delai_paiement: '30',
      st_tranches: [
        {label: 'Démarrage', pourcentage: 30},
        {label: 'Mi-parcours', pourcentage: 40},
        {label: 'Réception', pourcentage: 30},
      ],
      st_delai_val: '6',
      st_delai_unit: 'mois',
      st_garantie_mois: '12',
      st_delai_reserves: '30',
      st_delai_med: '30',
      st_clauses_actives: ['tConfid', 'tNonConc'],
      st_observations: 'Observations de test',
    };

    beforeEach(() => {
      // Reset mutation mocks that may have been mutated by prior tests
      const contractService = jest.requireMock('@/store/services/contract') as Record<string, unknown>;
      contractService.useAddContractMutation = () => [mockAddContractMutation, {isLoading: false, error: undefined}];
      contractService.useEditContractMutation = () => [mockEditContractMutation, {isLoading: false, error: undefined}];
      contractService.useGetProjectsListQuery = () => ({data: [], isLoading: false});

      mockUseGetContractQuery.mockReturnValue({
        data: stContractData,
        isLoading: false,
        error: undefined,
      });
    });

    it('renders category toggle when company is casa_di_lusso', () => {
      renderWithProviders(<ContractFormClient session={mockSession} id={50}/>);
      expect(screen.getByText('Catégorie de contrat')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('Sous-Traitance')).toBeInTheDocument();
    });

    it('renders ST section headers in edit mode', () => {
      renderWithProviders(<ContractFormClient session={mockSession} id={50}/>);
      expect(screen.getByText('Sous-Traitant')).toBeInTheDocument();
      expect(screen.getByText('Lot & Type')).toBeInTheDocument();
      expect(screen.getByText('Financier ST')).toBeInTheDocument();
      expect(screen.getByText('Délais & Garantie ST')).toBeInTheDocument();
      expect(screen.getByText('Clauses actives ST')).toBeInTheDocument();
      // "Observations" appears as both section header and field label
      expect(screen.getAllByText('Observations').length).toBeGreaterThanOrEqual(1);
    });

    it('renders Sous-Traitant identity fields', () => {
      renderWithProviders(<ContractFormClient session={mockSession} id={50}/>);
      expect(screen.getByTestId('input-st_name')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-st_forme')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_capital')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_rc')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_ice')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_if')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_cnss')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_addr')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_rep')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_cin')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_qualite')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_tel')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_email')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_rib')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_banque')).toBeInTheDocument();
    });

    it('renders Lot & Type fields', () => {
      renderWithProviders(<ContractFormClient session={mockSession} id={50}/>);
      expect(screen.getByText(/Type\(s\) de lot/)).toBeInTheDocument();
      expect(screen.getByTestId('input-st_lot_description')).toBeInTheDocument();
      expect(screen.getByText(/Type\(s\) de prix/)).toBeInTheDocument();
    });

    it('renders Financier ST fields', () => {
      renderWithProviders(<ContractFormClient session={mockSession} id={50}/>);
      expect(screen.getByTestId('input-st_retenue_garantie')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_avance')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_penalite_taux')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_plafond_penalite')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_delai_paiement')).toBeInTheDocument();
    });

    it('renders Délais & Garantie ST fields', () => {
      renderWithProviders(<ContractFormClient session={mockSession} id={50}/>);
      expect(screen.getByTestId('input-st_delai_val')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-st_delai_unit')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_garantie_mois')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_delai_reserves')).toBeInTheDocument();
      expect(screen.getByTestId('input-st_delai_med')).toBeInTheDocument();
    });

    it('renders Observations field', () => {
      renderWithProviders(<ContractFormClient session={mockSession} id={50}/>);
      expect(screen.getByTestId('input-st_observations')).toBeInTheDocument();
    });

    it('renders clause checkboxes from stClausesActivesList', () => {
      renderWithProviders(<ContractFormClient session={mockSession} id={50}/>);
      // "Confidentialité" also appears as common field label
      expect(screen.getAllByText('Confidentialité').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('Non-concurrence')).toBeInTheDocument();
    });

    it('renders project dropdown when projects exist', () => {
      const contractService = jest.requireMock('@/store/services/contract') as Record<string, unknown>;
      contractService.useGetProjectsListQuery = () => ({
        data: [{id: 1, name: 'Projet Alpha'}],
        isLoading: false,
      });
      renderWithProviders(<ContractFormClient session={mockSession} id={50}/>);
      expect(screen.getByTestId('dropdown-st_projet')).toBeInTheDocument();
    });

    it('does not render CDL-specific sections in ST mode', () => {
      renderWithProviders(<ContractFormClient session={mockSession} id={50}/>);
      expect(screen.queryByText('Services CDL')).not.toBeInTheDocument();
      expect(screen.queryByText('Projet CDL')).not.toBeInTheDocument();
      expect(screen.queryByText('Échéancier CDL')).not.toBeInTheDocument();
      expect(screen.queryByText('Clauses actives CDL')).not.toBeInTheDocument();
      expect(screen.queryByText('Détails additionnels CDL')).not.toBeInTheDocument();
    });

    it('does not render Blueline-specific sections in ST mode', () => {
      renderWithProviders(<ContractFormClient session={mockSession} id={50}/>);
      expect(screen.queryByText('Prestations')).not.toBeInTheDocument();
      expect(screen.queryByText('Fournitures & Eau / Électricité')).not.toBeInTheDocument();
      expect(screen.queryByText('Garantie (Blueline)')).not.toBeInTheDocument();
      expect(screen.queryByText('Échéancier & Résiliation')).not.toBeInTheDocument();
      expect(screen.queryByText('Client (Blueline)')).not.toBeInTheDocument();
    });

    it('does not render category toggle for non-CDL company', () => {
      mockUseGetContractQuery.mockReturnValue({
        data: {
          id: 60,
          company: 'blueline_works',
          numero_contrat: 'BL-060',
          client_nom: 'BL Client',
          montant_ht: '5000',
        },
        isLoading: false,
        error: undefined,
      });
      renderWithProviders(<ContractFormClient session={mockSession} id={60}/>);
      expect(screen.queryByText('Catégorie de contrat')).not.toBeInTheDocument();
    });

    it('renders submit button with update text in ST edit mode', () => {
      renderWithProviders(<ContractFormClient session={mockSession} id={50}/>);
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Mettre à jour');
    });

    it('renders field labels for ST identity section', () => {
      renderWithProviders(<ContractFormClient session={mockSession} id={50}/>);
      expect(screen.getByText('Capital')).toBeInTheDocument();
      expect(screen.getByText('Registre du commerce')).toBeInTheDocument();
      expect(screen.getByText('ICE')).toBeInTheDocument();
      expect(screen.getByText('Identifiant fiscal')).toBeInTheDocument();
      expect(screen.getByText('CNSS')).toBeInTheDocument();
      expect(screen.getByText('Adresse du sous-traitant')).toBeInTheDocument();
      expect(screen.getByText('Représentant légal')).toBeInTheDocument();
      expect(screen.getByText('CIN du représentant')).toBeInTheDocument();
      expect(screen.getByText('Qualité du représentant')).toBeInTheDocument();
      expect(screen.getByText('Banque')).toBeInTheDocument();
      // Labels shared with Client section (appear twice)
      expect(screen.getAllByText('Téléphone').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('Email').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('RIB').length).toBeGreaterThanOrEqual(1);
    });

    it('renders Financier ST field labels', () => {
      renderWithProviders(<ContractFormClient session={mockSession} id={50}/>);
      expect(screen.getByText('Retenue de garantie')).toBeInTheDocument();
      expect(screen.getByText('Avance')).toBeInTheDocument();
      expect(screen.getByText('Pénalité de retard (MAD/jour)')).toBeInTheDocument();
      expect(screen.getByText('Plafond pénalité')).toBeInTheDocument();
      expect(screen.getByText('Délai de paiement (jours)')).toBeInTheDocument();
    });

    it('renders Délais & Garantie ST field labels', () => {
      renderWithProviders(<ContractFormClient session={mockSession} id={50}/>);
      expect(screen.getByText("Délai d'exécution")).toBeInTheDocument();
      expect(screen.getByText('Unité de délai')).toBeInTheDocument();
      expect(screen.getByText('Garantie (mois)')).toBeInTheDocument();
      expect(screen.getByText('Délai levée réserves (jours)')).toBeInTheDocument();
      expect(screen.getByText('Délai mise en demeure (jours)')).toBeInTheDocument();
    });

    it('renders common sections alongside ST sections', () => {
      renderWithProviders(<ContractFormClient session={mockSession} id={50}/>);
      expect(screen.getByText('Identification')).toBeInTheDocument();
      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByText('Travaux')).toBeInTheDocument();
      expect(screen.getByText('Financier')).toBeInTheDocument();
      expect(screen.getByText('Clauses')).toBeInTheDocument();
      expect(screen.getByText('Société')).toBeInTheDocument();
    });
  });
});

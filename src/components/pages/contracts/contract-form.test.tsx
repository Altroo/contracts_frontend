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
	...jest.requireActual('@/store/services/contract'),
	useAddContractMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
	useEditContractMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
	useGetContractQuery: jest.fn(() => ({ data: undefined, isLoading: false })),
}));

jest.mock('@/utils/hooks', () => ({
	useToast: () => ({ onSuccess: jest.fn(), onError: jest.fn() }),
	useAppSelector: jest.fn(),
}));

jest.mock('@/utils/routes', () => ({
	CONTRACTS_LIST: '/contracts',
	CONTRACTS_VIEW: (id: number) => `/contracts/${id}`,
}));

jest.mock('@/components/formikElements/customTextInput/customTextInput', () => {
	const Mock = (props: Record<string, unknown>) => (
		<input data-testid={`custom-text-${props.id}`} placeholder={props.label as string} />
	);
	Mock.displayName = 'CustomTextInput';
	return { __esModule: true, default: Mock };
});

jest.mock('@/components/formikElements/customDropDownSelect/customDropDownSelect', () => {
	const Mock = (props: Record<string, unknown>) => (
		<select data-testid={`custom-select-${props.id}`} aria-label={props.label as string} />
	);
	Mock.displayName = 'CustomDropDownSelect';
	return { __esModule: true, default: Mock };
});

jest.mock('@/components/htmlElements/buttons/primaryLoadingButton/primaryLoadingButton', () => {
	const Mock = (props: Record<string, unknown>) => (
		<button data-testid="primary-btn" type="submit">{props.buttonText as string}</button>
	);
	Mock.displayName = 'PrimaryLoadingButton';
	return { __esModule: true, default: Mock };
});

jest.mock('@/components/formikElements/apiLoading/apiProgress/apiProgress', () => {
	const Mock = () => <div data-testid="api-progress" />;
	Mock.displayName = 'ApiProgress';
	return { __esModule: true, default: Mock };
});

jest.mock('@/components/formikElements/apiLoading/apiAlert/apiAlert', () => {
	const Mock = () => <div data-testid="api-alert" />;
	Mock.displayName = 'ApiAlert';
	return { __esModule: true, default: Mock };
});

describe('ContractFormClient — add mode', () => {
	it('renders add form title', () => {
		render(
			<Provider store={store}>
				<ContractFormClient />
			</Provider>,
		);
		expect(screen.getByText(/nouveau contrat/i)).toBeInTheDocument();
	});

	it('renders key text inputs and dropdowns', () => {
		render(
			<Provider store={store}>
				<ContractFormClient />
			</Provider>,
		);
		expect(screen.getByTestId('custom-text-numero_contrat')).toBeInTheDocument();
		expect(screen.getByTestId('custom-text-montant_ht')).toBeInTheDocument();
		expect(screen.getByTestId('custom-select-statut')).toBeInTheDocument();
		expect(screen.getByTestId('custom-select-devise')).toBeInTheDocument();
	});

	it('renders submit button with create text', () => {
		render(
			<Provider store={store}>
				<ContractFormClient />
			</Provider>,
		);
		expect(screen.getByTestId('primary-btn')).toHaveTextContent('Créer le contrat');
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

	it('renders submit button with update text', () => {
		render(
			<Provider store={store}>
				<ContractFormClient id={1} />
			</Provider>,
		);
		expect(screen.getByTestId('primary-btn')).toHaveTextContent('Mettre à jour');
	});
});

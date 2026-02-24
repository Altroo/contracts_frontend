import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import EditProfileClient from './edit-profile';

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

jest.mock('@/components/formikElements/apiLoading/apiAlert/apiAlert', () => {
	const Mock = () => <div data-testid="api-alert" />;
	Mock.displayName = 'ApiAlert';
	return { __esModule: true, default: Mock };
});

jest.mock('@/store/services/account', () => ({
	...jest.requireActual('@/store/services/account'),
	useEditProfilMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}));

jest.mock('@/store/selectors', () => ({
	getProfilState: () => ({ first_name: 'John', last_name: 'Doe', gender: 'H' }),
}));

jest.mock('@/store/actions/accountActions', () => ({
	accountEditProfilAction: jest.fn(),
}));

jest.mock('@/utils/hooks', () => ({
	useAppSelector: (fn: () => unknown) => fn(),
	useAppDispatch: () => jest.fn(),
	useToast: () => ({ onSuccess: jest.fn(), onError: jest.fn() }),
}));

describe('EditProfileClient', () => {
	it('renders profile form inputs', () => {
		render(
			<Provider store={store}>
				<EditProfileClient />
			</Provider>,
		);
		expect(screen.getByTestId('custom-text-first_name')).toBeInTheDocument();
		expect(screen.getByTestId('custom-text-last_name')).toBeInTheDocument();
		expect(screen.getByTestId('custom-select-gender')).toBeInTheDocument();
	});

	it('renders submit button', () => {
		render(
			<Provider store={store}>
				<EditProfileClient />
			</Provider>,
		);
		expect(screen.getByTestId('primary-btn')).toHaveTextContent('Enregistrer');
	});
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import PasswordClient from './password';

jest.mock('@/components/formikElements/customTextInput/customTextInput', () => {
	const Mock = (props: Record<string, unknown>) => (
		<input data-testid={`custom-text-${props.id}`} placeholder={props.label as string} />
	);
	Mock.displayName = 'CustomTextInput';
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
	useEditPasswordMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}));

jest.mock('@/utils/hooks', () => ({
	useAppSelector: (fn: () => unknown) => fn(),
	useAppDispatch: () => jest.fn(),
	useToast: () => ({ onSuccess: jest.fn(), onError: jest.fn() }),
}));

describe('PasswordClient', () => {
	it('renders three password fields', () => {
		render(
			<Provider store={store}>
				<PasswordClient />
			</Provider>,
		);
		expect(screen.getByTestId('custom-text-old_password')).toBeInTheDocument();
		expect(screen.getByTestId('custom-text-new_password')).toBeInTheDocument();
		expect(screen.getByTestId('custom-text-new_password2')).toBeInTheDocument();
	});

	it('renders submit button', () => {
		render(
			<Provider store={store}>
				<PasswordClient />
			</Provider>,
		);
		expect(screen.getByTestId('primary-btn')).toHaveTextContent('Mettre à jour');
	});
});

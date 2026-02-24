import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import UsersFormClient from './users-form';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/utils/hooks', () => ({
	useToast: () => ({ onSuccess: jest.fn(), onError: jest.fn() }),
	useAppSelector: jest.fn(),
	usePermission: () => ({ is_staff: true, can_view: true, can_print: true, can_create: true, can_edit: true, can_delete: true }),
}));

jest.mock('@/store/services/account', () => ({
	...jest.requireActual('@/store/services/account'),
	useAddUserMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
	useEditUserMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
	useGetUserQuery: jest.fn(() => ({ data: undefined, isLoading: false })),
}));

jest.mock('@/utils/routes', () => ({
	USERS_LIST: '/users',
	USERS_VIEW: (id: number) => `/users/${id}`,
	USERS_EDIT: (id: number) => `/users/${id}/edit`,
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
		<button data-testid="primary-button" type={(props.type as 'button' | 'submit' | 'reset') || 'button'}>
			{props.buttonText as string}
		</button>
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

describe('UsersFormClient — add mode', () => {
	it('renders form fields', () => {
		render(
			<Provider store={store}>
				<UsersFormClient />
			</Provider>,
		);
		expect(screen.getByTestId('custom-text-first_name')).toBeInTheDocument();
		expect(screen.getByTestId('custom-text-last_name')).toBeInTheDocument();
		expect(screen.getByTestId('custom-text-email')).toBeInTheDocument();
	});

	it('renders password fields in add mode', () => {
		render(
			<Provider store={store}>
				<UsersFormClient />
			</Provider>,
		);
		expect(screen.getByTestId('custom-text-password1')).toBeInTheDocument();
		expect(screen.getByTestId('custom-text-password2')).toBeInTheDocument();
	});

	it('renders add mode title', () => {
		render(
			<Provider store={store}>
				<UsersFormClient />
			</Provider>,
		);
		expect(screen.getByText(/nouvel utilisateur/i)).toBeInTheDocument();
	});
});

describe('UsersFormClient — edit mode', () => {
	it('renders edit mode title', () => {
		render(
			<Provider store={store}>
				<UsersFormClient id={1} />
			</Provider>,
		);
		expect(screen.getByText(/modifier l'utilisateur/i)).toBeInTheDocument();
	});

	it('does not render password fields in edit mode', () => {
		render(
			<Provider store={store}>
				<UsersFormClient id={1} />
			</Provider>,
		);
		expect(screen.queryByTestId('custom-text-password1')).not.toBeInTheDocument();
		expect(screen.queryByTestId('custom-text-password2')).not.toBeInTheDocument();
	});
});

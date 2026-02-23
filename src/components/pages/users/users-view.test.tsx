import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import UsersViewClient from './users-view';

jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/store/services/account', () => ({
	useGetUserQuery: jest.fn(() => ({ data: undefined, isLoading: false })),
	usePatchUserMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}));

jest.mock('@/utils/routes', () => ({
	USERS_LIST: '/users',
}));

describe('UsersViewClient', () => {
	it('shows error when user not found', () => {
		render(
			<Provider store={store}>
				<UsersViewClient id={99} />
			</Provider>,
		);
		expect(screen.getByText(/utilisateur introuvable/i)).toBeInTheDocument();
	});

	it('renders user details form', () => {
		const { useGetUserQuery } = jest.requireMock('@/store/services/account');
		(useGetUserQuery as jest.Mock).mockReturnValue({
			data: {
				id: 1,
				first_name: 'Marie',
				last_name: 'Martin',
				email: 'marie@test.com',
				is_active: true,
				is_staff: false,
				can_view: true,
				can_print: true,
				can_create: false,
				can_edit: false,
				can_delete: false,
			},
			isLoading: false,
		});
		render(
			<Provider store={store}>
				<UsersViewClient id={1} />
			</Provider>,
		);
		expect(screen.getByDisplayValue('Marie')).toBeInTheDocument();
		expect(screen.getByDisplayValue('marie@test.com')).toBeInTheDocument();
	});
});

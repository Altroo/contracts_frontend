import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import UsersListClient from './users-list';

jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/store/services/account', () => ({
	...jest.requireActual('@/store/services/account'),
	useGetUsersListQuery: jest.fn(() => ({ data: undefined, isLoading: false, isError: false })),
}));

jest.mock('@/utils/hooks', () => ({
	usePermission: () => ({ is_staff: true, can_view: true, can_print: true, can_create: true, can_edit: true, can_delete: true }),
}));

jest.mock('@/utils/routes', () => ({
	USERS_ADD: '/users/new',
	USERS_VIEW: (id: number) => `/users/${id}`,
}));

describe('UsersListClient', () => {
	it('renders empty state', () => {
		render(
			<Provider store={store}>
				<UsersListClient />
			</Provider>,
		);
		expect(screen.getByText(/aucun utilisateur trouvé/i)).toBeInTheDocument();
	});

	it('renders user row', () => {
		const { useGetUsersListQuery } = jest.requireMock('@/store/services/account');
		(useGetUsersListQuery as jest.Mock).mockReturnValue({
			data: [{ id: 1, first_name: 'Jean', last_name: 'Dupont', email: 'jean@test.com', is_active: true, is_staff: false }],
			isLoading: false,
			isError: false,
		});
		render(
			<Provider store={store}>
				<UsersListClient />
			</Provider>,
		);
		expect(screen.getByText(/jean dupont/i)).toBeInTheDocument();
		expect(screen.getByText('jean@test.com')).toBeInTheDocument();
	});
});

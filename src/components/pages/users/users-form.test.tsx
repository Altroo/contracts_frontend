import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import UsersFormClient from './users-form';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/store/services/account', () => ({
	useAddUserMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}));

jest.mock('@/utils/routes', () => ({
	USERS_LIST: '/users',
	USERS_VIEW: (id: number) => `/users/${id}`,
}));

describe('UsersFormClient', () => {
	it('renders form fields', () => {
		render(
			<Provider store={store}>
				<UsersFormClient />
			</Provider>,
		);
		expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/^nom$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
	});

	it('shows error when passwords do not match', async () => {
		render(
			<Provider store={store}>
				<UsersFormClient />
			</Provider>,
		);

		await act(async () => {
			fireEvent.change(screen.getByLabelText(/^mot de passe$/i), { target: { value: 'abc' } });
			fireEvent.change(screen.getByLabelText(/confirmer le mot de passe/i), { target: { value: 'xyz' } });
			fireEvent.click(screen.getByRole('button', { name: /créer/i }));
		});

		expect(screen.getByText(/les mots de passe ne correspondent pas/i)).toBeInTheDocument();
	});
});

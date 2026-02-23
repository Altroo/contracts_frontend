import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import LoginClient from './login';

const mockSignIn = jest.fn();
const mockPush = jest.fn();

jest.mock('next-auth/react', () => ({
	signIn: (...args: unknown[]) => mockSignIn(args),
}));

jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

describe('LoginClient', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders login form with email, password and submit button', () => {
		render(
			<Provider store={store}>
				<LoginClient />
			</Provider>,
		);
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
	});

	it('renders app title', () => {
		render(
			<Provider store={store}>
				<LoginClient />
			</Provider>,
		);
		expect(screen.getByText(/gestion des contrats/i)).toBeInTheDocument();
	});

	it('shows error message on failed login', async () => {
		mockSignIn.mockResolvedValueOnce({ error: 'CredentialsSignin' });

		render(
			<Provider store={store}>
				<LoginClient />
			</Provider>,
		);

		await act(async () => {
			fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
			fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'wrong' } });
			fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));
		});

		expect(await screen.findByText(/email ou mot de passe incorrect/i)).toBeInTheDocument();
	});

	it('redirects to dashboard on successful login', async () => {
		mockSignIn.mockResolvedValueOnce({ error: null });

		render(
			<Provider store={store}>
				<LoginClient />
			</Provider>,
		);

		await act(async () => {
			fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'admin@test.com' } });
			fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'pass' } });
			fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));
		});

		expect(mockPush).toHaveBeenCalled();
	});
});

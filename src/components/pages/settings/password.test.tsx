import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import PasswordClient from './password';

describe('PasswordClient', () => {
	beforeEach(() => {
		global.fetch = jest.fn();
	});

	it('renders password fields', () => {
		render(
			<Provider store={store}>
				<PasswordClient />
			</Provider>,
		);
		expect(screen.getByLabelText(/mot de passe actuel/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/confirmer/i)).toBeInTheDocument();
	});

	it('shows error when new passwords do not match', async () => {
		render(
			<Provider store={store}>
				<PasswordClient />
			</Provider>,
		);

		await act(async () => {
			fireEvent.change(screen.getByLabelText(/nouveau mot de passe/i), { target: { value: 'abc' } });
			fireEvent.change(screen.getByLabelText(/confirmer/i), { target: { value: 'xyz' } });
			fireEvent.click(screen.getByRole('button', { name: /mettre à jour/i }));
		});

		expect(screen.getByText(/les nouveaux mots de passe ne correspondent pas/i)).toBeInTheDocument();
	});
});

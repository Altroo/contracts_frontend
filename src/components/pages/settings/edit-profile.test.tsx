import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import EditProfileClient from './edit-profile';

jest.mock('@/store/services/account', () => ({
	useEditProfilMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}));

jest.mock('@/store/selectors', () => ({
	getProfilState: () => null,
}));

jest.mock('@/store/actions/accountActions', () => ({
	accountEditProfilAction: jest.fn(),
}));

describe('EditProfileClient', () => {
	it('renders profile form inputs', () => {
		render(
			<Provider store={store}>
				<EditProfileClient />
			</Provider>,
		);
		expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
	});

	it('renders submit button', () => {
		render(
			<Provider store={store}>
				<EditProfileClient />
			</Provider>,
		);
		expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument();
	});
});

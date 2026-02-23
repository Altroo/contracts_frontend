import { type Metadata } from 'next';
import UsersListClient from '@/components/pages/users/users-list';

export const metadata: Metadata = {
	title: 'Utilisateurs',
};

const UsersListPage = () => <UsersListClient />;

export default UsersListPage;

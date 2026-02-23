import { type Metadata } from 'next';
import UsersFormClient from '@/components/pages/users/users-form';

export const metadata: Metadata = {
	title: 'Nouvel utilisateur',
};

const UserAddPage = () => <UsersFormClient />;

export default UserAddPage;

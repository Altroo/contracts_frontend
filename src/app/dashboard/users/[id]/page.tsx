import { type Metadata } from 'next';
import UsersViewClient from '@/components/pages/users/users-view';

export const metadata: Metadata = {
	title: 'Utilisateur',
};

interface Props {
	params: Promise<{ id: string }>;
}

const UserDetailPage = async ({ params }: Props) => {
	const { id } = await params;
	return <UsersViewClient id={Number(id)} />;
};

export default UserDetailPage;

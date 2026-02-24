import { redirect } from 'next/navigation';
import { type Metadata } from 'next';
import { auth } from '@/auth';
import { AUTH_LOGIN } from '@/utils/routes';
import ContractsListClient from '@/components/pages/contracts/contracts-list';

export const metadata: Metadata = {
	title: 'Liste des contrats',
	description: 'Liste des contrats',
};

const ContractsListPage = async () => {
	const session = await auth();

	if (!session) {
		redirect(AUTH_LOGIN);
	}

	return <ContractsListClient session={session} />;
};

export default ContractsListPage;

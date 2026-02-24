import { redirect } from 'next/navigation';
import { type Metadata } from 'next';
import { auth } from '@/auth';
import { AUTH_LOGIN } from '@/utils/routes';
import ContractFormClient from '@/components/pages/contracts/contract-form';

export const metadata: Metadata = {
	title: 'Nouveau contrat',
	description: 'Créer un nouveau contrat',
};

const ContractAddPage = async () => {
	const session = await auth();

	if (!session) {
		redirect(AUTH_LOGIN);
	}

	return <ContractFormClient session={session} />;
};

export default ContractAddPage;

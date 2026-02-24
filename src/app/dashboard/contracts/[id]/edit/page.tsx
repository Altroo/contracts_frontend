import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AUTH_LOGIN, CONTRACTS_LIST } from '@/utils/routes';
import ContractFormClient from '@/components/pages/contracts/contract-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Modifier un contrat',
	description: 'Modifier un contrat existant',
};

interface Props {
	params: Promise<{ id: string }>;
}

const ContractEditPage = async ({ params }: Props) => {
	const session = await auth();
	const { id } = await params;

	if (!session) {
		redirect(AUTH_LOGIN);
	}

	if (!id || isNaN(Number(id))) {
		redirect(CONTRACTS_LIST);
	}

	return <ContractFormClient session={session} id={Number(id)} />;
};

export default ContractEditPage;

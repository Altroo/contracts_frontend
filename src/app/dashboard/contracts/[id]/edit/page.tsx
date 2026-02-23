import { type Metadata } from 'next';
import ContractFormClient from '@/components/pages/contracts/contract-form';

export const metadata: Metadata = {
	title: 'Modifier un contrat',
};

interface Props {
	params: Promise<{ id: string }>;
}

const ContractEditPage = async ({ params }: Props) => {
	const { id } = await params;
	return <ContractFormClient id={Number(id)} />;
};

export default ContractEditPage;

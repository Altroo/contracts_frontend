import { type Metadata } from 'next';
import ContractViewClient from '@/components/pages/contracts/contract-view';

export const metadata: Metadata = {
	title: 'Contrat',
};

interface Props {
	params: Promise<{ id: string }>;
}

const ContractViewPage = async ({ params }: Props) => {
	const { id } = await params;
	return <ContractViewClient id={Number(id)} />;
};

export default ContractViewPage;

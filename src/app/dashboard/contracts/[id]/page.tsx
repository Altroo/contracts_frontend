import {redirect} from 'next/navigation';
import {auth} from '@/auth';
import {AUTH_LOGIN, CONTRACTS_LIST} from '@/utils/routes';
import ContractViewClient from '@/components/pages/contracts/contract-view';
import type {Metadata} from 'next';
import {getServerTranslations} from '@/utils/serverTranslations';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getServerTranslations();
  return {
    title: t.metadata.contractDetailsTitle,
    description: t.metadata.contractDetailsDescription,
  };
};

interface Props {
  params: Promise<{ id: string }>;
}

const ContractViewPage = async ({params}: Props) => {
  const session = await auth();
  const {id} = await params;

  if (!session) {
    redirect(AUTH_LOGIN);
  }

  if (!id || isNaN(Number(id))) {
    redirect(CONTRACTS_LIST);
  }

  return <ContractViewClient session={session} id={Number(id)}/>;
};

export default ContractViewPage;

import {redirect} from 'next/navigation';
import type {Metadata} from 'next';
import {auth} from '@/auth';
import {AUTH_LOGIN} from '@/utils/routes';
import ContractsListClient from '@/components/pages/contracts/contracts-list';
import {getServerTranslations} from '@/utils/serverTranslations';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getServerTranslations();
  return {
    title: t.metadata.contractsListTitle,
    description: t.metadata.contractsListDescription,
  };
};

const ContractsListPage = async () => {
  const session = await auth();

  if (!session) {
    redirect(AUTH_LOGIN);
  }

  return <ContractsListClient session={session}/>;
};

export default ContractsListPage;

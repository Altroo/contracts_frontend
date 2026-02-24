import { contractApi } from '@/store/services/contract';
import { setupApiStore } from '@/store/setupApiStore';

beforeAll(() => {
	process.env.NEXT_PUBLIC_CONTRACT_LIST ||= 'https://example.com/contracts/';
	process.env.NEXT_PUBLIC_CONTRACT_ROOT ||= 'https://example.com';
});

jest.mock('@/utils/axiosBaseQuery', () => ({
	axiosBaseQuery: () => async () => ({ data: { ok: true } }),
}));

describe('contractApi', () => {
	const storeRef = setupApiStore(contractApi);

	it('getContractsList query (no pagination) completes without error', async () => {
		const result = await storeRef.store.dispatch(
			contractApi.endpoints.getContractsList.initiate({ with_pagination: false }),
		);
		expect('error' in result).toBe(false);
	});

	it('getContractsList query (with pagination) completes without error', async () => {
		const result = await storeRef.store.dispatch(
			contractApi.endpoints.getContractsList.initiate({
				with_pagination: true,
				page: 1,
				pageSize: 10,
				search: '',
			}),
		);
		expect('error' in result).toBe(false);
	});

	it('getContractsList query with statut filter completes without error', async () => {
		const result = await storeRef.store.dispatch(
			contractApi.endpoints.getContractsList.initiate({ statut: 'En cours' }),
		);
		expect('error' in result).toBe(false);
	});

	it('getContract query completes without error', async () => {
		const result = await storeRef.store.dispatch(contractApi.endpoints.getContract.initiate({ id: 1 }));
		expect('error' in result).toBe(false);
	});

	it('addContract mutation completes without error', async () => {
		const result = await storeRef.store.dispatch(
			contractApi.endpoints.addContract.initiate({
				data: { numero_contrat: 'CTR-001', date_contrat: '2024-01-01' },
			}),
		);
		expect('error' in result).toBe(false);
	});

	it('editContract mutation completes without error', async () => {
		const result = await storeRef.store.dispatch(
			contractApi.endpoints.editContract.initiate({
				id: 1,
				data: { numero_contrat: 'CTR-001-MOD' },
			}),
		);
		expect('error' in result).toBe(false);
	});

	it('patchContractStatut mutation completes without error', async () => {
		const result = await storeRef.store.dispatch(
			contractApi.endpoints.patchContractStatut.initiate({ id: 1, data: { statut: 'Signé' } }),
		);
		expect('error' in result).toBe(false);
	});

	it('deleteContract mutation completes without error', async () => {
		const result = await storeRef.store.dispatch(contractApi.endpoints.deleteContract.initiate({ id: 1 }));
		expect('error' in result).toBe(false);
	});
});

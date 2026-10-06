import { usersApi } from './account';
import { contractApi } from './contract';
import { setupApiStore } from '@/store/setupApiStore';

jest.mock('@/utils/axiosBaseQuery', () => {
	const baseQuery = jest.fn(async () => ({ data: { count: 0, results: [] } }));
	return { axiosBaseQuery: () => baseQuery, mockOrderingBaseQuery: baseQuery };
});
const { mockOrderingBaseQuery } = jest.requireMock('@/utils/axiosBaseQuery') as { mockOrderingBaseQuery: jest.Mock };

describe('getUsersList ordering', () => {
	const storeRef = setupApiStore(usersApi);
	it.each(['name', '-name'])('forwards %s to the API', async (ordering) => {
		mockOrderingBaseQuery.mockClear();
		const params = {
			company_id: 1,
			store: 1,
			with_pagination: true,
			page: 2,
			pageSize: 5,
			search: 'keep-filter',
			ordering,
		};
		const request = storeRef.store.dispatch(usersApi.endpoints.getUsersList.initiate(params));
		await request;
		expect(mockOrderingBaseQuery).toHaveBeenCalled();
		expect(mockOrderingBaseQuery.mock.calls.at(-1)?.[0].params).toEqual(expect.objectContaining({ ordering }));
		request.unsubscribe();
	});
});

describe('getContractsList ordering', () => {
	const storeRef = setupApiStore(contractApi);
	it.each(['name', '-name'])('forwards %s to the API', async (ordering) => {
		mockOrderingBaseQuery.mockClear();
		const params = {
			company_id: 1,
			store: 1,
			with_pagination: true,
			page: 2,
			pageSize: 5,
			search: 'keep-filter',
			ordering,
		};
		const request = storeRef.store.dispatch(contractApi.endpoints.getContractsList.initiate(params));
		await request;
		expect(mockOrderingBaseQuery).toHaveBeenCalled();
		expect(mockOrderingBaseQuery.mock.calls.at(-1)?.[0].params).toEqual(expect.objectContaining({ ordering }));
		request.unsubscribe();
	});
});

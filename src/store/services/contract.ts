import { createApi } from '@reduxjs/toolkit/query/react';
import { isAuthenticatedInstance } from '@/utils/helpers';
import { axiosBaseQuery } from '@/utils/axiosBaseQuery';
import { getInitStateToken } from '@/store/selectors';
import type { ContractClass } from '@/models/classes';
import type { ApiErrorResponseType, PaginationResponseType, SuccessResponseType } from '@/types/_initTypes';
import type { RootState } from '@/store/store';
import { initToken } from '@/store/slices/_initSlice';
import type { ContractStatutType, ProjectType, CompanyConfigType } from '@/types/contractTypes';

export const contractApi = createApi({
	reducerPath: 'contractApi',
	tagTypes: ['Contract', 'Project', 'CompanyConfig'],
	baseQuery: axiosBaseQuery((api) =>
		isAuthenticatedInstance(
			() => getInitStateToken(api.getState() as RootState),
			() => api.dispatch(initToken()),
		),
	),
	endpoints: (builder) => ({
		getContractsList: builder.query<
			Array<Partial<ContractClass>> | PaginationResponseType<ContractClass>,
			{
				with_pagination?: boolean;
				page?: number;
				pageSize?: number;
				search?: string;
				statut?: ContractStatutType;
				date_after?: string;
				date_before?: string;
				[key: string]: string | number | boolean | undefined;
			}
		>({
			query: ({ with_pagination, page, pageSize, search, statut, date_after, date_before, ...rest }) => ({
				url: process.env.NEXT_PUBLIC_CONTRACT_LIST,
				method: 'GET',
				params: {
					pagination: with_pagination || undefined,
					page: with_pagination ? page : undefined,
					page_size: with_pagination ? pageSize : undefined,
					search,
					statut,
					date_after,
					date_before,
					...rest,
				},
			}),
			providesTags: ['Contract'],
		}),

		getContract: builder.query<ContractClass, { id: number }>({
			query: ({ id }) => ({
				url: `${process.env.NEXT_PUBLIC_CONTRACT_ROOT}/${id}/`,
				method: 'GET',
			}),
			providesTags: ['Contract'],
		}),

		getCodeReference: builder.query<Pick<ContractClass, 'numero_contrat'>, void>({
			query: () => ({
				url: process.env.NEXT_PUBLIC_CONTRACT_GENERATE_CODE_REFERENCE,
				method: 'GET',
			}),
			providesTags: ['Contract'],
		}),

		addContract: builder.mutation<ContractClass, { data: Partial<ContractClass> }>({
			query: ({ data }) => ({
				url: `${process.env.NEXT_PUBLIC_CONTRACT_ROOT}/`,
				method: 'POST',
				data,
			}),
			invalidatesTags: ['Contract'],
		}),

		editContract: builder.mutation<SuccessResponseType<ContractClass>, { id: number; data: Partial<ContractClass> }>({
			query: ({ id, data }) => ({
				url: `${process.env.NEXT_PUBLIC_CONTRACT_ROOT}/${id}/`,
				method: 'PUT',
				data,
			}),
			invalidatesTags: ['Contract'],
		}),

		patchContractStatut: builder.mutation<
			SuccessResponseType<ContractClass>,
			{ id: number; data: { statut: ContractStatutType } }
		>({
			query: ({ id, data }) => ({
				url: `${process.env.NEXT_PUBLIC_CONTRACT_ROOT}/switch_statut/${id}/`,
				method: 'PATCH',
				data,
			}),
			invalidatesTags: ['Contract'],
		}),

		deleteContract: builder.mutation<void | ApiErrorResponseType, { id: number }>({
			query: ({ id }) => ({
				url: `${process.env.NEXT_PUBLIC_CONTRACT_ROOT}/${id}/`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Contract'],
		}),

		bulkDeleteContracts: builder.mutation<void | ApiErrorResponseType, { ids: number[] }>({
			query: ({ ids }) => ({
				url: `${process.env.NEXT_PUBLIC_CONTRACT_ROOT}/bulk_delete/`,
				method: 'DELETE',
				data: { ids },
			}),
			invalidatesTags: ['Contract'],
		}),

		/* ── Projects ── */
		getProjectsList: builder.query<ProjectType[], { company?: string }>({
			query: ({ company }) => ({
				url: process.env.NEXT_PUBLIC_PROJECT_LIST,
				method: 'GET',
				params: company ? { company } : undefined,
			}),
			providesTags: ['Project'],
		}),

		addProject: builder.mutation<ProjectType, { data: Partial<ProjectType> }>({
			query: ({ data }) => ({
				url: process.env.NEXT_PUBLIC_PROJECT_LIST,
				method: 'POST',
				data,
			}),
			invalidatesTags: ['Project'],
		}),

		/* ── Company Config ── */
		getCompanyConfigsList: builder.query<CompanyConfigType[], void>({
			query: () => ({
				url: process.env.NEXT_PUBLIC_COMPANY_CONFIG_LIST,
				method: 'GET',
			}),
			providesTags: ['CompanyConfig'],
		}),
	}),
});

export const {
	useGetContractsListQuery,
	useGetContractQuery,
	useGetCodeReferenceQuery,
	useAddContractMutation,
	useEditContractMutation,
	usePatchContractStatutMutation,
	useDeleteContractMutation,
	useBulkDeleteContractsMutation,
	useGetProjectsListQuery,
	useAddProjectMutation,
	useGetCompanyConfigsListQuery,
} = contractApi;

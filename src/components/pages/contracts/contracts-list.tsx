'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Visibility as VisibilityIcon,
	Add as AddIcon,
	Close as CloseIcon,
} from '@mui/icons-material';
import { GridColDef, GridRenderCellParams, GridFilterModel, GridLogicOperator } from '@mui/x-data-grid';
import { getAccessTokenFromSession } from '@/store/session';
import Styles from '@/styles/dashboard/dashboard.module.sass';
import { useDeleteContractMutation, useGetContractsListQuery, useBulkDeleteContractsMutation } from '@/store/services/contract';
import { CONTRACTS_VIEW, CONTRACTS_EDIT, CONTRACTS_ADD } from '@/utils/routes';
import DarkTooltip from '@/components/htmlElements/tooltip/darkTooltip/darkTooltip';
import type { PaginationResponseType, SessionProps } from '@/types/_initTypes';
import PaginatedDataGrid from '@/components/shared/paginatedDataGrid/paginatedDataGrid';
import ActionModals from '@/components/htmlElements/modals/actionModal/actionModals';
import type { ContractClass } from '@/models/classes';
import { formatDate, extractApiErrorMessage, normalizeStatut } from '@/utils/helpers';
import { contractStatusColors } from '@/utils/rawData';
import { useToast } from '@/utils/hooks';
import { Protected } from '@/components/layouts/protected/protected';
import MobileActionsMenu from '@/components/shared/mobileActionsMenu/mobileActionsMenu';
import {
	createDropdownFilterOperators,
} from '@/components/shared/dropdownFilter/dropdownFilter';
import { createDateRangeFilterOperator } from '@/components/shared/dateRangeFilter/dateRangeFilterOperator';

const ContractsListClient: React.FC<SessionProps> = ({ session }: SessionProps) => {
	const router = useRouter();
	const { onSuccess, onError } = useToast();
	const token = getAccessTokenFromSession(session);

	const [paginationModel, setPaginationModel] = useState<{ page: number; pageSize: number }>({
		page: 0,
		pageSize: 10,
	});
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [], logicOperator: GridLogicOperator.And });
	const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
	const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
	const [customFilterParams, setCustomFilterParams] = useState<Record<string, string>>({});

	// Bulk selection state
	const [selectedContractIds, setSelectedContractIds] = useState<number[]>([]);
	const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);

	const {
		data: rawData,
		isLoading,
		refetch,
	} = useGetContractsListQuery(
		{
			with_pagination: true,
			page: paginationModel.page + 1,
			pageSize: paginationModel.pageSize,
			search: searchTerm,
			...customFilterParams,
		},
		{ skip: !token },
	);
	const data = rawData as PaginationResponseType<ContractClass> | undefined;

	const [deleteRecord] = useDeleteContractMutation();
	const [bulkDeleteContracts] = useBulkDeleteContractsMutation();

	const deleteHandler = async () => {
		try {
			await deleteRecord({ id: selectedContractId! }).unwrap();
			onSuccess('Contrat supprimé avec succès');
			refetch();
		} catch (err) {
			onError(extractApiErrorMessage(err, 'Erreur lors de la suppression du contrat'));
		} finally {
			setShowDeleteModal(false);
		}
	};

	const deleteModalActions = [
		{ text: 'Annuler', active: false, onClick: () => setShowDeleteModal(false), icon: <CloseIcon />, color: '#6B6B6B' },
		{ text: 'Supprimer', active: true, onClick: deleteHandler, icon: <DeleteIcon />, color: '#D32F2F' },
	];

	const showDeleteModalCall = (id: number) => {
		setSelectedContractId(id);
		setShowDeleteModal(true);
	};

	const handleSelectionChange = (ids: number[]) => {
		setSelectedContractIds(ids);
	};

	const bulkDeleteHandler = async () => {
		try {
			await bulkDeleteContracts({ ids: selectedContractIds }).unwrap();
			onSuccess(`${selectedContractIds.length} contrat(s) supprimé(s) avec succès`);
		} catch (err) {
			onError(extractApiErrorMessage(err, `Erreur lors de la suppression`));
		} finally {
			setSelectedContractIds([]);
			setShowBulkDeleteModal(false);
			refetch();
		}
	};

	const bulkDeleteModalActions = [
		{ text: 'Annuler', active: false, onClick: () => setShowBulkDeleteModal(false), icon: <CloseIcon />, color: '#6B6B6B' },
		{ text: `Supprimer (${selectedContractIds.length})`, active: true, onClick: bulkDeleteHandler, icon: <DeleteIcon />, color: '#D32F2F' },
	];

	const statutFilterOptions = React.useMemo(
		() => [
			{ value: 'Brouillon', label: 'Brouillon' },
			{ value: 'Envoyé', label: 'Envoyé' },
			{ value: 'Signé', label: 'Signé' },
			{ value: 'En cours', label: 'En cours' },
			{ value: 'Terminé', label: 'Terminé' },
			{ value: 'Annulé', label: 'Annulé' },
			{ value: 'Expiré', label: 'Expiré' },
		],
		[],
	);

	const columns: GridColDef[] = [
		{
			field: 'numero_contrat',
			headerName: 'Référence',
			flex: 1,
			minWidth: 130,
			renderCell: (params: GridRenderCellParams<ContractClass>) => (
				<DarkTooltip title={params.value}>
					<Typography variant="body2" noWrap>
						{params.value}
					</Typography>
				</DarkTooltip>
			),
		},
		{
			field: 'client_nom',
			headerName: 'Client',
			flex: 1.2,
			minWidth: 130,
			renderCell: (params: GridRenderCellParams<ContractClass>) => (
				<DarkTooltip title={params.value ?? '—'}>
					<Typography variant="body2" noWrap>
						{params.value ?? '—'}
					</Typography>
				</DarkTooltip>
			),
		},
		{
			field: 'type_contrat_display',
			headerName: 'Type de contrat',
			flex: 1.2,
			minWidth: 140,
			renderCell: (params: GridRenderCellParams<ContractClass>) => (
				<DarkTooltip title={params.value}>
					<Typography variant="body2" noWrap>
						{params.value}
					</Typography>
				</DarkTooltip>
			),
		},
		{
			field: 'statut',
			headerName: 'Statut',
			flex: 0.8,
			minWidth: 100,
			filterOperators: createDropdownFilterOperators(statutFilterOptions, 'Tous'),
			renderCell: (params: GridRenderCellParams<ContractClass>) => {
				const statut = params.value as string;
				return (
					<Chip
						label={statut}
						color={contractStatusColors[normalizeStatut(statut)] ?? 'default'}
						size="small"
					/>
				);
			},
		},
		{
			field: 'date_contrat',
			headerName: 'Date du contrat',
			flex: 1,
			minWidth: 130,
			filterOperators: createDateRangeFilterOperator(),
			renderCell: (params: GridRenderCellParams<ContractClass>) => {
				const formatted = formatDate(params.value as string | null);
				return (
					<DarkTooltip title={formatted}>
						<Typography variant="body2" noWrap>
							{formatted}
						</Typography>
					</DarkTooltip>
				);
			},
		},
		{
			field: 'montant_ht',
			headerName: 'Montant HT',
			flex: 1,
			minWidth: 120,
			renderCell: (params: GridRenderCellParams<ContractClass>) => {
				const value = params.value != null
					? `${Number(params.value).toLocaleString('fr-MA')} ${params.row.devise}`
					: '—';
				return (
					<DarkTooltip title={value}>
						<Typography variant="body2" noWrap>
							{value}
						</Typography>
					</DarkTooltip>
				);
			},
		},
		{
			field: 'actions',
			headerName: 'Actions',
			flex: 1.5,
			minWidth: 150,
			sortable: false,
			filterable: false,
			renderCell: (params) => {
				const actions = [
					{
						label: 'Voir',
						icon: <VisibilityIcon />,
						onClick: () => router.push(CONTRACTS_VIEW(params.row.id)),
						color: 'info' as const,
					},
					{
						label: 'Modifier',
						icon: <EditIcon />,
						onClick: () => router.push(CONTRACTS_EDIT(params.row.id)),
						color: 'primary' as const,
					},
					{
						label: 'Supprimer',
						icon: <DeleteIcon />,
						onClick: () => showDeleteModalCall(params.row.id),
						color: 'error' as const,
					},
				];

				return <MobileActionsMenu actions={actions} />;
			},
		},
	];

	return (
		<main className={`${Styles.main} ${Styles.fixMobile}`}>
		<Stack
			direction="column"
			spacing={2}
			className={Styles.flexRootStack}
			sx={{ p: { xs: 2, md: 3 }, overflowX: 'auto', overflowY: 'hidden' }}
		>
			<Box
				sx={{
					width: '100%',
					display: 'flex',
					justifyContent: 'flex-start',
					gap: 2,
					pt: 2,
				}}
			>
				<Button
					variant="contained"
					onClick={() => router.push(CONTRACTS_ADD)}
					sx={{
						whiteSpace: 'nowrap',
						px: { xs: 1.5, sm: 2, md: 3 },
						py: { xs: 0.8, sm: 1, md: 1 },
						fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
					}}
					startIcon={<AddIcon fontSize="small" />}
				>
					Nouveau contrat
				</Button>
				{selectedContractIds.length > 0 && (
					<Button
						variant="outlined"
						color="error"
						onClick={() => setShowBulkDeleteModal(true)}
						startIcon={<DeleteIcon fontSize="small" />}
						sx={{
							whiteSpace: 'nowrap',
							px: { xs: 1.5, sm: 2, md: 3 },
							py: { xs: 0.8, sm: 1, md: 1 },
							fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
						}}
					>
						Supprimer ({selectedContractIds.length})
					</Button>
				)}
			</Box>

			<PaginatedDataGrid
				data={data}
				isLoading={isLoading}
				columns={columns}
				paginationModel={paginationModel}
				setPaginationModel={setPaginationModel}
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				filterModel={filterModel}
				onFilterModelChange={setFilterModel}
				onCustomFilterParamsChange={setCustomFilterParams}
				toolbar={{ quickFilter: true, debounceMs: 500 }}
				checkboxSelection
				onSelectionChange={handleSelectionChange}
				selectedIds={selectedContractIds}
			/>
			{showDeleteModal && (
				<ActionModals
					title="Supprimer ce contrat ?"
					body="Êtes‑vous sûr de vouloir supprimer ce contrat ?"
					actions={deleteModalActions}
					titleIcon={<DeleteIcon />}
					titleIconColor="#D32F2F"
				/>
			)}
			{showBulkDeleteModal && (
				<ActionModals
					title={`Supprimer ${selectedContractIds.length} contrat(s) ?`}
					body={`Êtes-vous sûr de vouloir supprimer les ${selectedContractIds.length} contrat(s) sélectionné(s) ?`}
					actions={bulkDeleteModalActions}
					titleIcon={<DeleteIcon />}
					titleIconColor="#D32F2F"
				/>
			)}
		</Stack>
		</main>
	);
};

export default ContractsListClient;

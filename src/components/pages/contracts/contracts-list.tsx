'use client';

import React, {useCallback, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Box, Button, Chip, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {GridColDef, GridFilterModel, GridLogicOperator, GridRenderCellParams} from '@mui/x-data-grid';
import {useInitAccessToken} from '@/contexts/InitContext';
import Styles from '@/styles/dashboard/dashboard.module.sass';
import {
  useBulkDeleteContractsMutation,
  useDeleteContractMutation,
  useGetContractsListQuery
} from '@/store/services/contract';
import {CONTRACT_DOC, CONTRACT_PDF, CONTRACTS_ADD, CONTRACTS_EDIT, CONTRACTS_VIEW} from '@/utils/routes';
import DarkTooltip from '@/components/htmlElements/tooltip/darkTooltip/darkTooltip';
import type {PaginationResponseType, SessionProps} from '@/types/_initTypes';
import PaginatedDataGrid from '@/components/shared/paginatedDataGrid/paginatedDataGrid';
import ActionModals from '@/components/htmlElements/modals/actionModal/actionModals';
import type {ContractClass} from '@/models/classes';
import {extractApiErrorMessage, formatDate} from '@/utils/helpers';
import {companyItemsList, getContractStatusColor, getTranslatedRawData} from '@/utils/rawData';
import {useToast, useLanguage} from '@/utils/hooks';
import {fetchFileBlob} from '@/utils/apiHelpers';
import PdfLanguageModal from '@/components/shared/pdfLanguageModal/pdfLanguageModal';
import ApiProgress from '@/components/formikElements/apiLoading/apiProgress/apiProgress';
import {Protected} from '@/components/layouts/protected/protected';
import NavigationBar from '@/components/layouts/navigationBar/navigationBar';
import MobileActionsMenu from '@/components/shared/mobileActionsMenu/mobileActionsMenu';
import {createDropdownFilterOperators,} from '@/components/shared/dropdownFilter/dropdownFilter';
import {createDateRangeFilterOperator} from '@/components/shared/dateRangeFilter/dateRangeFilterOperator';
import {createNumericFilterOperators} from '@/components/shared/numericFilter/numericFilterOperator';
import type {ChipFilterConfig} from '@/components/shared/chipSelectFilter/chipSelectFilterBar';
import ChipSelectFilterBar from '@/components/shared/chipSelectFilter/chipSelectFilterBar';

const ContractsListClient: React.FC<SessionProps> = ({session}: SessionProps) => {
  const router = useRouter();
  const {onSuccess, onError} = useToast();
  const {t} = useLanguage();
  const {contractCategoryItemsList} = getTranslatedRawData(t);
  const token = useInitAccessToken(session);

  const [paginationModel, setPaginationModel] = useState<{ page: number; pageSize: number }>({
    page: 0,
    pageSize: 10,
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterModel, setFilterModel] = useState<GridFilterModel>({items: [], logicOperator: GridLogicOperator.And});
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [customFilterParams, setCustomFilterParams] = useState<Record<string, string>>({});
  const [chipFilterParams, setChipFilterParams] = useState<Record<string, string>>({});

  // Bulk selection state
  const [selectedContractIds, setSelectedContractIds] = useState<number[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);

  // Print menu state
  const [printAnchorEl, setPrintAnchorEl] = useState<HTMLElement | null>(null);
  const [printMenuItemId, setPrintMenuItemId] = useState<number | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [pendingDocFormat, setPendingDocFormat] = useState<'pdf' | 'docx' | null>(null);
  const [isDocLoading, setIsDocLoading] = useState(false);
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
      ...chipFilterParams,
    },
    {skip: !token},
  );
  const data = rawData as PaginationResponseType<ContractClass> | undefined;

  const [deleteRecord] = useDeleteContractMutation();
  const [bulkDeleteContracts] = useBulkDeleteContractsMutation();

  const deleteHandler = async () => {
    try {
      await deleteRecord({id: selectedContractId!}).unwrap();
      onSuccess(t.contracts.contractDeletedSuccess);
      refetch();
    } catch (err) {
      onError(extractApiErrorMessage(err, t.errors.deletionError));
    } finally {
      setShowDeleteModal(false);
    }
  };

  const deleteModalActions = [
    {text: t.common.cancel, active: false, onClick: () => setShowDeleteModal(false), icon: <CloseIcon/>, color: '#6B6B6B'},
    {text: t.common.delete, active: true, onClick: deleteHandler, icon: <DeleteIcon/>, color: '#D32F2F'},
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
      await bulkDeleteContracts({ids: selectedContractIds}).unwrap();
      onSuccess(t.contracts.bulkContractDeletedSuccess(selectedContractIds.length));
    } catch (err) {
      onError(extractApiErrorMessage(err, t.errors.deletionError));
    } finally {
      setSelectedContractIds([]);
      setShowBulkDeleteModal(false);
      refetch();
    }
  };

  const bulkDeleteModalActions = [
    {
      text: t.common.cancel,
      active: false,
      onClick: () => setShowBulkDeleteModal(false),
      icon: <CloseIcon/>,
      color: '#6B6B6B'
    },
    {
      text: `${t.common.delete} (${selectedContractIds.length})`,
      active: true,
      onClick: bulkDeleteHandler,
      icon: <DeleteIcon/>,
      color: '#D32F2F'
    },
  ];

  const showPrintMenuCall = useCallback((e: React.MouseEvent<HTMLElement>, id: number) => {
    setPrintAnchorEl(e.currentTarget);
    setPrintMenuItemId(id);
  }, []);

  const handlePrintMenuClose = useCallback(() => {
    setPrintAnchorEl(null);
    setPrintMenuItemId(null);
  }, []);

  const handlePrintMenuItemClick = useCallback((format: 'pdf' | 'docx') => {
    setPrintAnchorEl(null);
    setPendingDocFormat(format);
    setShowLanguageModal(true);
  }, []);

  const handleLanguageSelect = useCallback(
    async (language: 'fr' | 'en') => {
      setShowLanguageModal(false);
      if (!pendingDocFormat || printMenuItemId === null) return;
      setIsDocLoading(true);
      try {
        let url: string;
        if (pendingDocFormat === 'pdf') url = CONTRACT_PDF(printMenuItemId, language);
        else url = CONTRACT_DOC(printMenuItemId, language);
        const blob = await fetchFileBlob(url, token!);
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
      } catch {
        onError(t.errors.documentOpenError);
      } finally {
        setPendingDocFormat(null);
        setPrintMenuItemId(null);
        setIsDocLoading(false);
      }
    },
    [pendingDocFormat, printMenuItemId, token, onError, t.errors.documentOpenError],
  );

  const handleLanguageModalClose = useCallback(() => {
    setShowLanguageModal(false);
    setPendingDocFormat(null);
    setPrintMenuItemId(null);
  }, []);

  const statutFilterOptions = React.useMemo(
    () => [
      {value: 'Brouillon', label: t.contracts.statusDraft, color: 'default' as const},
      {value: 'Envoyé', label: t.contracts.statusSent, color: 'info' as const},
      {value: 'Signé', label: t.contracts.statusSigned, color: 'primary' as const},
      {value: 'En cours', label: t.contracts.statusInProgress, color: 'warning' as const},
      {value: 'Terminé', label: t.contracts.statusCompleted, color: 'success' as const},
      {value: 'Annulé', label: t.contracts.statusCancelled, color: 'error' as const},
      {value: 'Expiré', label: t.contracts.statusExpired, color: 'warning' as const},
    ],
    [t],
  );

  const chipFilters = React.useMemo<ChipFilterConfig[]>(
    () => [
      {
        key: 'company',
        label: t.contracts.company,
        paramName: 'company',
        options: companyItemsList.map((c) => ({id: c.code, nom: c.value})),
      },
      {
        key: 'contract_category',
        label: t.contracts.category,
        paramName: 'contract_category',
        options: contractCategoryItemsList.map((c) => ({id: c.code, nom: c.value})),
      },
    ],
    [t, contractCategoryItemsList],
  );

  const columns: GridColDef[] = [
    {
      field: 'numero_contrat',
      headerName: t.contracts.reference,
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
      headerName: t.contracts.client,
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
      field: 'company',
      headerName: t.contracts.company,
      flex: 0.9,
      minWidth: 120,
      filterable: false,
      renderCell: (params: GridRenderCellParams<ContractClass>) => {
        const label = params.row.company_display ?? params.value ?? '—';
        return (
          <DarkTooltip title={label}>
            <Chip
              label={label}
              size="small"
              variant="outlined"
              color={params.row.company === 'blueline_works' ? 'info' : 'warning'}
            />
          </DarkTooltip>
        );
      },
    },
    {
      field: 'contract_category',
      headerName: t.contracts.category,
      flex: 0.9,
      minWidth: 130,
      filterable: false,
      renderCell: (params: GridRenderCellParams<ContractClass>) => {
        const catCode = params.value as string | undefined;
        const catItem = contractCategoryItemsList.find((c) => c.code === catCode);
        const label = catItem?.value ?? catCode ?? '—';
        const color = catCode === 'sous_traitance' ? 'secondary' : 'default';
        return (
          <DarkTooltip title={label}>
            <Chip label={label} size="small" variant="outlined" color={color}/>
          </DarkTooltip>
        );
      },
    },
    {
      field: 'type_contrat_display',
      headerName: t.contracts.contractType,
      flex: 1.2,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams<ContractClass>) => {
        const value = params.row.contract_category === 'sous_traitance' ? '—' : (params.value ?? '—');
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
      field: 'statut',
      headerName: t.contracts.status,
      flex: 0.8,
      minWidth: 100,
      filterOperators: createDropdownFilterOperators(statutFilterOptions, t.common.allStatuses, true, t.filters.is),
      renderCell: (params: GridRenderCellParams<ContractClass>) => {
        const statut = params.value as string;
        return (
          <DarkTooltip title={statut || '-'}>
            <Chip
              label={statut || '-'}
              color={getContractStatusColor(statut)}
              variant="outlined"
            />
          </DarkTooltip>
        );
      },
    },
    {
      field: 'date_contrat',
      headerName: t.contracts.contractDate,
      flex: 1,
      minWidth: 130,
      filterOperators: createDateRangeFilterOperator(t.filters.between),
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
      headerName: t.contracts.amountHT,
      flex: 1,
      minWidth: 120,
      filterOperators: createNumericFilterOperators(),
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
      headerName: t.common.actions,
      flex: 1.5,
      minWidth: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const actions = [
          {
            label: t.common.view,
            icon: <VisibilityIcon/>,
            onClick: () => router.push(CONTRACTS_VIEW(params.row.id)),
            color: 'info' as const,
          },
          {
            label: t.common.edit,
            icon: <EditIcon/>,
            onClick: () => router.push(CONTRACTS_EDIT(params.row.id)),
            color: 'primary' as const,
          },
          {
            label: t.common.display,
            icon: <PrintIcon/>,
            onClick: (e?: React.MouseEvent<HTMLElement>) => {
              if (e) {
                showPrintMenuCall(e, params.row.id);
              }
            },
            color: 'info' as const,
          },
          {
            label: t.common.delete,
            icon: <DeleteIcon/>,
            onClick: () => showDeleteModalCall(params.row.id),
            color: 'error' as const,
          },
        ];

        return (
          <Box onClick={(e) => e.stopPropagation()}>
            <MobileActionsMenu actions={actions}/>
          </Box>
        );
      },
    },
  ];

  return (
    <Stack
      direction="column"
      spacing={2}
      className={Styles.flexRootStack}
      mt="48px"
      sx={{overflowX: 'auto', overflowY: 'hidden'}}
    >
      <NavigationBar title={t.navigation.contractsList}>
        <Protected permission="can_view">
          <>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-start',
                gap: 2,
                px: {xs: 1, sm: 2, md: 3},
                mt: {xs: 1, sm: 2, md: 3},
                mb: {xs: 1, sm: 2, md: 3},
              }}
            >
              <Button
                variant="contained"
                onClick={() => router.push(CONTRACTS_ADD)}
                sx={{
                  whiteSpace: 'nowrap',
                  px: {xs: 1.5, sm: 2, md: 3},
                  py: {xs: 0.8, sm: 1, md: 1},
                  fontSize: {xs: '0.85rem', sm: '0.9rem', md: '1rem'},
                }}
                startIcon={<AddIcon fontSize="small"/>}
              >
                {t.navigation.newContract}
              </Button>
              {selectedContractIds.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setShowBulkDeleteModal(true)}
                  startIcon={<DeleteIcon fontSize="small"/>}
                  sx={{
                    whiteSpace: 'nowrap',
                    px: {xs: 1.5, sm: 2, md: 3},
                    py: {xs: 0.8, sm: 1, md: 1},
                    fontSize: {xs: '0.85rem', sm: '0.9rem', md: '1rem'},
                  }}
                >
                  {t.common.delete} ({selectedContractIds.length})
                </Button>
              )}
            </Box>

            <ChipSelectFilterBar filters={chipFilters} onFilterChange={setChipFilterParams} columns={1}/>

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
              toolbar={{quickFilter: true, debounceMs: 500}}
              checkboxSelection
              onSelectionChange={handleSelectionChange}
              selectedIds={selectedContractIds}
              onRowClick={(params) => router.push(CONTRACTS_VIEW(params.row.id))}
            />
            {showDeleteModal && (
              <ActionModals
                title={t.contracts.deleteContract}
                body={t.contracts.deleteContractBody}
                actions={deleteModalActions}
                titleIcon={<DeleteIcon/>}
                titleIconColor="#D32F2F"
              />
            )}
            {showBulkDeleteModal && (
              <ActionModals
                title={t.contracts.deleteContractConfirm(selectedContractIds.length)}
                body={t.contracts.bulkDeleteContractBody(selectedContractIds.length)}
                actions={bulkDeleteModalActions}
                titleIcon={<DeleteIcon/>}
                titleIconColor="#D32F2F"
              />
            )}

            <Menu
              anchorEl={printAnchorEl}
              open={Boolean(printAnchorEl)}
              onClose={handlePrintMenuClose}
              slotProps={{paper: {elevation: 3, sx: {minWidth: 240}}}}
            >
              <MenuItem onClick={() => handlePrintMenuItemClick('pdf')}>
                <ListItemIcon sx={{color: '#d32f2f'}}><PictureAsPdfIcon/></ListItemIcon>
                <ListItemText>{t.common.displayPdf}</ListItemText>
              </MenuItem>
              <Divider/>
              <MenuItem onClick={() => handlePrintMenuItemClick('docx')}>
                <ListItemIcon sx={{color: '#1976d2'}}><DescriptionIcon/></ListItemIcon>
                <ListItemText>{t.common.displayDocx}</ListItemText>
              </MenuItem>
            </Menu>

            {isDocLoading && <ApiProgress backdropColor="#FFFFFF" circularColor="#0D070B"/>}
            {showLanguageModal &&
              <PdfLanguageModal onSelectLanguage={handleLanguageSelect} onClose={handleLanguageModalClose}/>}
          </>
        </Protected>
      </NavigationBar>
    </Stack>
  );
};

export default ContractsListClient;

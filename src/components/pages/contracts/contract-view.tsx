'use client';

import React, {isValidElement, useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import type {ApiErrorResponseType, ResponseDataInterface, SessionProps} from '@/types/_initTypes';
import {useInitAccessToken} from '@/contexts/InitContext';
import {
  useDeleteContractMutation,
  useGetContractQuery,
  usePatchContractStatutMutation
} from '@/store/services/contract';
import Styles from '@/styles/dashboard/dashboard.module.sass';
import NavigationBar from '@/components/layouts/navigationBar/navigationBar';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Apartment as ApartmentIcon,
  Architecture as ArchitectureIcon,
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Attachment as AttachmentIcon,
  AttachMoney as MoneyIcon,
  Badge as BadgeIcon,
  Build as BuildIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
  Category as CategoryIcon,
  Checklist as ChecklistIcon,
  Construction as ConstructionIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Gavel as GavelIcon,
  Home as HomeIcon,
  ListAlt as ListAltIcon,
  LocationCity as CityIcon,
  Notes as NotesIcon,
  Percent as PercentIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  PictureAsPdf as PictureAsPdfIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  Plumbing as PlumbingIcon,
  Shield as ShieldIcon,
  SquareFoot as SquareFootIcon,
  Timer as TimerIcon,
  Water as WaterIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import {CONTRACT_DOC, CONTRACT_PDF, CONTRACTS_EDIT, CONTRACTS_LIST} from '@/utils/routes';
import ApiProgress from '@/components/formikElements/apiLoading/apiProgress/apiProgress';
import {extractApiErrorMessage, formatDate, formatDateShort} from '@/utils/helpers';
import {useToast, useLanguage} from '@/utils/hooks';
import {fetchFileBlob} from '@/utils/apiHelpers';
import PdfLanguageModal from '@/components/shared/pdfLanguageModal/pdfLanguageModal';
import ActionModals from '@/components/htmlElements/modals/actionModal/actionModals';
import {Protected} from '@/components/layouts/protected/protected';
import ApiAlert from '@/components/formikElements/apiLoading/apiAlert/apiAlert';
import {
  companyItemsList,
  getContractStatusColor,
  getTranslatedRawData,
} from '@/utils/rawData';
import type {ContractStatutType} from '@/types/contractTypes';

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined | React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({icon, label, value}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const displayValue = React.isValidElement(value)
    ? value
    : value === null || value === undefined || String(value).trim() === ''
      ? '-'
      : value;

  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      spacing={2}
      sx={{
        py: 1.5,
        flexWrap: 'wrap',
      }}
    >
      <Box
        sx={{
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          minWidth: 40,
        }}
      >
        {icon}
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        spacing={isMobile ? 0 : 2}
        sx={{
          flex: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography
          fontWeight={600}
          color="text.secondary"
          sx={{
            minWidth: {xs: '100%', sm: 200},
            wordBreak: 'break-word',
          }}
        >
          {label}
        </Typography>

        <Box sx={{flex: 1}}>
          {isValidElement(displayValue) ? (
            displayValue
          ) : (
            <Typography sx={{color: 'text.primary'}}>{displayValue}</Typography>
          )}
        </Box>
      </Stack>
    </Stack>
  );
};

interface Props extends SessionProps {
  id: number;
}

const ContractViewClient: React.FC<Props> = ({session, id}) => {
  const router = useRouter();
  const token = useInitAccessToken(session);
  const {data: contract, isLoading, error} = useGetContractQuery({id}, {skip: !token});
  const axiosError = useMemo(
    () => (error ? (error as ResponseDataInterface<ApiErrorResponseType>) : undefined),
    [error],
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [deleteRecord] = useDeleteContractMutation();
  const [patchStatut] = usePatchContractStatutMutation();
  const {onSuccess, onError} = useToast();
  const {t} = useLanguage();
  const {
    clauseResiliationItemsList,
    clientQualiteItemsList,
    contractCategoryItemsList,
    contractStatutItemsList,
    eauElectriciteItemsList,
    fournituresItemsList,
    garantieItemsList,
    garantieTypeItemsList,
    garantieUniteItemsList,
    modePaiementTexteItemsList,
    prestationNomItemsList,
    prestationUniteItemsList,
    stClausesActivesList,
    stDelaiUnitItemsList,
    stFormeJuridiqueItemsList,
    stLotTypeItemsList,
    stTypePrixItemsList,
    typeBienItemsList,
  } = getTranslatedRawData(t);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [pendingDocFormat, setPendingDocFormat] = useState<'pdf' | 'docx' | null>(null);
  const [isDocLoading, setIsDocLoading] = useState(false);

  const openDocument = (format: 'pdf' | 'docx') => {
    setPendingDocFormat(format);
    setShowLanguageModal(true);
  };

  const handleLanguageSelect = async (language: 'fr' | 'en') => {
    setShowLanguageModal(false);
    if (!token || !pendingDocFormat) return;
    setIsDocLoading(true);
    try {
      let url: string;
      if (pendingDocFormat === 'pdf') url = CONTRACT_PDF(id, language);
      else url = CONTRACT_DOC(id, language);
      const blob = await fetchFileBlob(url, token);
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
    } catch {
      onError(t.errors.documentOpenError);
    } finally {
      setPendingDocFormat(null);
      setIsDocLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRecord({id}).unwrap();
      onSuccess(t.contracts.contractDeletedSuccess);
      router.push(CONTRACTS_LIST);
    } catch (err) {
      onError(extractApiErrorMessage(err, t.errors.deletionError));
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = async (newStatut: ContractStatutType) => {
    try {
      await patchStatut({id, data: {statut: newStatut}}).unwrap();
      onSuccess(`${t.contracts.statusUpdated} : ${newStatut}`);
    } catch (err) {
      onError(extractApiErrorMessage(err, t.contracts.statusUpdateError));
    }
  };

  const deleteModalActions = [
    {
      text: t.common.cancel,
      active: false,
      onClick: () => setShowDeleteModal(false),
      icon: <ArrowBackIcon/>,
      color: '#6B6B6B',
    },
    {
      text: t.common.delete,
      active: true,
      onClick: handleDelete,
      icon: <DeleteIcon/>,
      color: '#D32F2F',
    },
  ];

  const statusColor = contract ? getContractStatusColor(contract.statut) : 'default';
  const isBlueline = contract?.company === 'blueline_works';
  const isST = contract?.company === 'casa_di_lusso' && contract?.contract_category === 'sous_traitance';
  const isCDL = !isBlueline && !isST;

  const resolveLabel = (list: Array<{ code: string; value: string }>, code: string | null | undefined) =>
    list.find((i) => i.code === code)?.value ?? code ?? '-';

  return (
    <Stack direction="column" spacing={2} className={Styles.flexRootStack} mt="32px">
      <NavigationBar title={t.contracts.contractDetails}>
        <Protected permission="can_view">
          <Stack spacing={3} sx={{p: {xs: 2, md: 3}, mt: 2}}>
            <Stack direction={isMobile ? 'column' : 'row'} justifyContent="space-between"
                   alignItems={isMobile ? 'stretch' : 'center'} spacing={2}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBackIcon/>}
                onClick={() => router.push(CONTRACTS_LIST)}
                sx={{width: isMobile ? '100%' : 'auto'}}
              >
                {t.navigation.contractsList}
              </Button>
              {!isLoading && !error && (
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<PictureAsPdfIcon/>}
                    onClick={() => openDocument('pdf')}
                    disabled={isDocLoading}
                  >
                    PDF
                  </Button>
                  <Button
                    variant="outlined"
                    color="info"
                    size="small"
                    startIcon={<DescriptionIcon/>}
                    onClick={() => openDocument('docx')}
                    disabled={isDocLoading}
                  >
                    DOCX
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon/>}
                    onClick={() => router.push(CONTRACTS_EDIT(id))}
                  >
                    {t.common.edit}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon/>}
                    onClick={() => setShowDeleteModal(true)}
                  >
                    {t.common.delete}
                  </Button>
                </Stack>
              )}
            </Stack>
            {isDocLoading && <ApiProgress backdropColor="#FFFFFF" circularColor="#0D070B"/>}
            {isLoading ? (
              <ApiProgress backdropColor="#FFFFFF" circularColor="#0D070B"/>
            ) : (axiosError?.status as number) > 400 ? (
              <ApiAlert
                errorDetails={axiosError?.data.details}
                cssStyle={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ) : !contract ? (
              <Alert severity="warning">{t.contracts.contractNotFound}</Alert>
            ) : (
              <Stack spacing={3}>
                {/* Header Card */}
                <Card elevation={2} sx={{borderRadius: 2}}>
                  <CardContent sx={{p: 3}}>
                    <Stack
                      direction={isMobile ? 'column' : 'row'}
                      spacing={3}
                      alignItems={isMobile ? 'center' : 'flex-start'}
                    >
                      <Stack spacing={2} sx={{flex: 1, width: '100%'}}>
                        <Stack spacing={1} alignItems={isMobile ? 'center' : 'flex-start'}>
                          <Typography
                            variant="h4"
                            textAlign={isMobile ? 'center' : 'inherit'}
                            fontSize={isMobile ? '20px' : '25px'}
                            fontWeight={700}
                          >
                            {contract?.numero_contrat ?? t.contracts.contract}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Chip icon={<BadgeIcon/>} label={`ID: ${contract?.id}`} size="small" variant="outlined"/>
                            <Chip
                              label={contract?.statut}
                              color={statusColor}
                              variant="outlined"
                            />
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Status Change */}
                <Card elevation={2} sx={{borderRadius: 2}}>
                  <CardContent sx={{p: 3}}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                      <AssignmentIcon color="primary"/>
                      <Typography variant="h6" fontWeight={700}>
                        {t.contracts.changeStatus}
                      </Typography>
                    </Stack>
                    <Divider sx={{mb: 2}}/>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {contractStatutItemsList.map((item) => (
                        <Chip
                          key={item.code}
                          label={item.value}
                          color={contract?.statut === item.code ? getContractStatusColor(item.code) : 'default'}
                          variant={contract?.statut === item.code ? 'filled' : 'outlined'}
                          onClick={() => {
                            if (contract?.statut !== item.code) {
                              handleStatusChange(item.code as ContractStatutType).then();
                            }
                          }}
                          sx={{cursor: contract?.statut === item.code ? 'default' : 'pointer'}}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Informations générales */}
                <Card elevation={2} sx={{borderRadius: 2}}>
                  <CardContent
                    sx={{
                      px: {xs: 2, md: 3},
                      py: {xs: 2, md: 3},
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                      <DescriptionIcon color="primary"/>
                      <Typography variant="h6" fontWeight={700}>
                        {t.contracts.generalInfo}
                      </Typography>
                    </Stack>

                    <Divider sx={{mb: {xs: 1.5, md: 2}}}/>

                    <Stack spacing={0}>
                      <InfoRow icon={<DescriptionIcon/>} label={t.contracts.contractNumber} value={contract?.numero_contrat}/>
                      <Divider/> <InfoRow
                      icon={<BusinessIcon/>}
                      label={t.contracts.company}
                      value={
                        <Chip
                          label={contract?.company_display ?? resolveLabel(companyItemsList, contract?.company)}
                          color={isBlueline ? 'info' : 'warning'}
                          variant="outlined"
                          size="small"
                        />
                      }
                    />
                      <Divider/>
                      {contract?.contract_category && (
                        <>
                          <InfoRow
                            icon={<CategoryIcon/>}
                            label={t.contracts.category}
                            value={
                              <Chip
                                label={contract?.contract_category_display ?? resolveLabel(contractCategoryItemsList, contract?.contract_category)}
                                color={isST ? 'secondary' : 'default'}
                                variant="outlined"
                                size="small"
                              />
                            }
                          />
                          <Divider/>
                        </>
                      )}
                      <InfoRow icon={<CalendarTodayIcon/>} label={t.contracts.contractDate}
                               value={contract?.date_contrat && formatDateShort(contract.date_contrat)}/>
                      {!isST && (
                        <>
                          <Divider/>
                          <InfoRow icon={<CategoryIcon/>} label={t.contracts.contractType}
                                   value={contract?.type_contrat_display ?? contract?.type_contrat}/>
                        </>
                      )}
                      <Divider/>
                      <InfoRow icon={<CityIcon/>} label={t.contracts.signatureCity} value={contract?.ville_signature}/>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Client — hidden for ST when client_nom is empty */}
                {(!isST || !!contract?.client_nom) && (
                  <Card elevation={2} sx={{borderRadius: 2}}>
                    <CardContent
                      sx={{
                        px: {xs: 2, md: 3},
                        py: {xs: 2, md: 3},
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                        <PersonIcon color="primary"/>
                        <Typography variant="h6" fontWeight={700}>
                          {isST ? t.contracts.masterOfWorks : t.contracts.client}
                        </Typography>
                      </Stack>

                      <Divider sx={{mb: {xs: 1.5, md: 2}}}/>

                      <Stack spacing={0}>
                        <InfoRow icon={<PersonIcon/>} label={t.users.lastName} value={contract?.client_nom}/>
                        <Divider/>
                        <InfoRow icon={<BadgeIcon/>} label={t.contracts.cinNumber} value={contract?.client_cin}/>
                        <Divider/>
                        <InfoRow icon={<WorkIcon/>} label={t.contracts.quality}
                                 value={resolveLabel(clientQualiteItemsList, contract?.client_qualite)}/>
                        <Divider/>
                        <InfoRow icon={<PhoneIcon/>} label={t.contracts.phone} value={contract?.client_tel}/>
                        <Divider/>
                        <InfoRow icon={<EmailIcon/>} label={t.contracts.email} value={contract?.client_email}/>
                        <Divider/>
                        <InfoRow icon={<HomeIcon/>} label={t.contracts.address} value={contract?.client_adresse}/>
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Travaux */}
                <Card elevation={2} sx={{borderRadius: 2}}>
                  <CardContent
                    sx={{
                      px: {xs: 2, md: 3},
                      py: {xs: 2, md: 3},
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                      <BuildIcon color="primary"/>
                      <Typography variant="h6" fontWeight={700}>
                        {t.contracts.works}
                      </Typography>
                    </Stack>

                    <Divider sx={{mb: {xs: 1.5, md: 2}}}/>

                    <Stack spacing={0}>
                      <InfoRow icon={<ApartmentIcon/>} label={t.contracts.propertyType}
                               value={resolveLabel(typeBienItemsList, contract?.type_bien)}/>
                      <Divider/>
                      <InfoRow icon={<SquareFootIcon/>} label={t.contracts.surface}
                               value={contract?.surface != null ? String(contract.surface) : undefined}/>
                      <Divider/>
                      <InfoRow icon={<HomeIcon/>} label={t.contracts.workAddress} value={contract?.adresse_travaux}/>
                      <Divider/>
                      <InfoRow icon={<CalendarTodayIcon/>} label={t.contracts.startDate}
                               value={contract?.date_debut && formatDateShort(contract.date_debut)}/>
                      <Divider/>
                      <InfoRow icon={<ConstructionIcon/>} label={t.contracts.workDescription} value={contract?.description_travaux}/>
                      <Divider/>
                      <InfoRow icon={<TimerIcon/>} label={t.contracts.estimatedDuration} value={contract?.duree_estimee}/>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Financier */}
                <Card elevation={2} sx={{borderRadius: 2}}>
                  <CardContent
                    sx={{
                      px: {xs: 2, md: 3},
                      py: {xs: 2, md: 3},
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                      <MoneyIcon color="primary"/>
                      <Typography variant="h6" fontWeight={700}>
                        {t.contracts.financial}
                      </Typography>
                    </Stack>

                    <Divider sx={{mb: {xs: 1.5, md: 2}}}/>

                    <Stack spacing={0}>
                      <InfoRow
                        icon={<MoneyIcon/>}
                        label={t.contracts.amountHT}
                        value={contract?.montant_ht != null ? `${Number(contract.montant_ht).toLocaleString('fr-MA')} ${contract.devise}` : undefined}
                      />
                      <Divider/>
                      <InfoRow icon={<PercentIcon/>} label={t.contracts.tva}
                               value={contract?.tva != null ? String(contract.tva) : undefined}/>
                      <Divider/>
                      <InfoRow
                        icon={<MoneyIcon/>}
                        label={t.contracts.amountTVA}
                        value={contract?.montant_tva != null ? `${Number(contract.montant_tva).toLocaleString('fr-MA')} ${contract.devise}` : undefined}
                      />
                      <Divider/>
                      <InfoRow
                        icon={<MoneyIcon/>}
                        label={t.contracts.amountTTC}
                        value={contract?.montant_ttc != null ? `${Number(contract.montant_ttc).toLocaleString('fr-MA')} ${contract.devise}` : undefined}
                      />
                      <Divider/>
                      <InfoRow icon={<MoneyIcon/>} label={t.contracts.latePenalty}
                               value={contract?.penalite_retard != null ? `${contract.penalite_retard} MAD/j` : undefined}/>
                      {!isBlueline && (
                        <>
                          <Divider/>
                          <InfoRow icon={<ShieldIcon/>} label={t.contracts.warranty}
                                   value={resolveLabel(garantieItemsList, contract?.garantie)}/>
                        </>
                      )}
                      <Divider/>
                      <InfoRow icon={<MoneyIcon/>} label={t.contracts.paymentMethod}
                               value={resolveLabel(modePaiementTexteItemsList, contract?.mode_paiement_texte)}/>
                      <Divider/>
                      <InfoRow icon={<MoneyIcon/>} label={t.contracts.ribCoordinates} value={contract?.rib}/>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Clauses */}
                <Card elevation={2} sx={{borderRadius: 2}}>
                  <CardContent
                    sx={{
                      px: {xs: 2, md: 3},
                      py: {xs: 2, md: 3},
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                      <GavelIcon color="primary"/>
                      <Typography variant="h6" fontWeight={700}>
                        {t.contracts.clausesSection}
                      </Typography>
                    </Stack>

                    <Divider sx={{mb: {xs: 1.5, md: 2}}}/>

                    <Stack spacing={0}>
                      <InfoRow icon={<GavelIcon/>} label={t.contracts.competentCourt} value={contract?.tribunal}/>
                      {!isBlueline && (
                        <>
                          <Divider/>
                          <InfoRow icon={<PersonIcon/>} label={t.contracts.projectManager}
                                   value={contract?.responsable_projet}/>
                          <Divider/>
                          <InfoRow icon={<ShieldIcon/>} label={t.contracts.confidentiality} value={contract?.confidentialite}/>
                        </>
                      )}
                    </Stack>
                  </CardContent>
                </Card>

                {/* ── CDL-specific sections ── */}
                {isCDL && (
                  <>
                    {/* Services CDL */}
                    {contract?.services && contract.services.length > 0 && (
                      <Card elevation={2} sx={{borderRadius: 2}}>
                        <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                            <ChecklistIcon color="primary"/>
                            <Typography variant="h6" fontWeight={700}>{t.contracts.servicesCDL}</Typography>
                          </Stack>
                          <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                          <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                            {contract.services.map((svc, idx) => (
                              <Chip key={idx} label={svc} color="primary" variant="outlined" size="small"/>
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    )}

                    {/* Projet CDL */}
                    {(contract?.architecte || contract?.conditions_acces) && (
                      <Card elevation={2} sx={{borderRadius: 2}}>
                        <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                            <ArchitectureIcon color="primary"/>
                            <Typography variant="h6" fontWeight={700}>{t.contracts.projectCDL}</Typography>
                          </Stack>
                          <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                          <Stack spacing={0}>
                            <InfoRow icon={<ArchitectureIcon/>} label={t.contracts.architect} value={contract?.architecte}/>
                            <Divider/>
                            <InfoRow icon={<HomeIcon/>} label={t.contracts.accessConditions} value={contract?.conditions_acces}/>
                          </Stack>
                        </CardContent>
                      </Card>
                    )}

                    {/* Échéancier CDL (Tranches) */}
                    {contract?.tranches && contract.tranches.length > 0 && (
                      <Card elevation={2} sx={{borderRadius: 2}}>
                        <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                            <PlaylistAddCheckIcon color="primary"/>
                            <Typography variant="h6" fontWeight={700}>{t.contracts.scheduleCDL}</Typography>
                          </Stack>
                          <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{fontWeight: 700}}>{t.contracts.trancheLabel}</TableCell>
                                  <TableCell sx={{fontWeight: 700}} align="right">{t.contracts.tranchePercentage}</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {contract.tranches.map((tr, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{tr.label || `${t.contracts.trancheLabel} ${idx + 1}`}</TableCell>
                                    <TableCell align="right">{tr.pourcentage}%</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* CDL penalty/delay fields (shown independently of tranches) */}
                    {(contract?.delai_retard != null || contract?.frais_redemarrage != null || contract?.delai_reserves != null) && (
                      <Card elevation={2} sx={{borderRadius: 2}}>
                        <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                            <TimerIcon color="primary"/>
                            <Typography variant="h6" fontWeight={700}>{t.contracts.penaltiesDelaysCDL}</Typography>
                          </Stack>
                          <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                          <Stack spacing={0}>
                            <InfoRow icon={<TimerIcon/>} label={t.contracts.delayDays}
                                     value={contract?.delai_retard != null ? String(contract.delai_retard) : undefined}/>
                            <Divider/>
                            <InfoRow icon={<MoneyIcon/>} label={`${t.contracts.restartFees} (${contract?.devise ?? 'MAD'})`}
                                     value={contract?.frais_redemarrage != null ? Number(contract.frais_redemarrage).toLocaleString('fr-MA') : undefined}/>
                            <Divider/>
                            <InfoRow icon={<TimerIcon/>} label={t.contracts.delaysReserves}
                                     value={contract?.delai_reserves != null ? String(contract.delai_reserves) : undefined}/>
                          </Stack>
                        </CardContent>
                      </Card>
                    )}

                    {/* Clauses actives CDL */}
                    {contract?.clauses_actives && contract.clauses_actives.length > 0 && (
                      <Card elevation={2} sx={{borderRadius: 2}}>
                        <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                            <GavelIcon color="primary"/>
                            <Typography variant="h6" fontWeight={700}>{t.contracts.activeClausesCDL}</Typography>
                          </Stack>
                          <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                          <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                            {contract.clauses_actives.map((clause, idx) => (
                              <Chip key={idx} label={clause} color="secondary" variant="outlined" size="small"/>
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    )}

                    {/* Détails additionnels CDL */}
                    {(contract?.clause_spec || contract?.exclusions || contract?.annexes) && (
                      <Card elevation={2} sx={{borderRadius: 2}}>
                        <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                            <AttachmentIcon color="primary"/>
                            <Typography variant="h6" fontWeight={700}>{t.contracts.additionalDetails}</Typography>
                          </Stack>
                          <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                          <Stack spacing={0}>
                            <InfoRow icon={<GavelIcon/>} label={t.contracts.specificClause} value={contract?.clause_spec}/>
                            <Divider/>
                            <InfoRow icon={<GavelIcon/>} label={t.contracts.exclusions} value={contract?.exclusions}/>
                            <Divider/>
                            <InfoRow icon={<AttachmentIcon/>} label={t.contracts.annexes} value={contract?.annexes}/>
                          </Stack>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {/* ── ST-specific sections ── */}
                {isST && (
                  <>
                    {/* Sous-Traitant Identity */}
                    <Card elevation={2} sx={{borderRadius: 2}}>
                      <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                          <PersonIcon color="primary"/>
                          <Typography variant="h6" fontWeight={700}>{t.contracts.subcontractorSection}</Typography>
                        </Stack>
                        <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                        <Stack spacing={0}>
                          {contract?.st_projet_detail && (
                            <>
                              <InfoRow icon={<ArchitectureIcon/>} label={t.contracts.architectDesigner}
                                       value={contract.st_projet_detail.name}/>
                              <Divider/>
                            </>
                          )}
                          <InfoRow icon={<BusinessIcon/>} label={t.contracts.stSubcontractorName} value={contract?.st_name}/>
                          <Divider/>
                          <InfoRow icon={<DescriptionIcon/>} label={t.contracts.stLegalForm}
                                   value={resolveLabel(stFormeJuridiqueItemsList, contract?.st_forme)}/>
                          <Divider/>
                          <InfoRow icon={<MoneyIcon/>} label={t.contracts.stCapital} value={contract?.st_capital}/>
                          <Divider/>
                          <InfoRow icon={<BadgeIcon/>} label={t.contracts.stTradeRegister} value={contract?.st_rc}/>
                          <Divider/>
                          <InfoRow icon={<BadgeIcon/>} label={t.contracts.stICE} value={contract?.st_ice}/>
                          <Divider/>
                          <InfoRow icon={<BadgeIcon/>} label={t.contracts.stTaxId} value={contract?.st_if}/>
                          <Divider/>
                          <InfoRow icon={<ShieldIcon/>} label={t.contracts.stCNSS} value={contract?.st_cnss}/>
                          <Divider/>
                          <InfoRow icon={<HomeIcon/>} label={t.contracts.address} value={contract?.st_addr}/>
                          <Divider/>
                          <InfoRow icon={<PersonIcon/>} label={t.contracts.stLegalRep} value={contract?.st_rep}/>
                          <Divider/>
                          <InfoRow icon={<BadgeIcon/>} label={t.contracts.stRepCIN} value={contract?.st_cin}/>
                          <Divider/>
                          <InfoRow icon={<WorkIcon/>} label={t.contracts.quality} value={contract?.st_qualite}/>
                          <Divider/>
                          <InfoRow icon={<PhoneIcon/>} label={t.contracts.phone} value={contract?.st_tel}/>
                          <Divider/>
                          <InfoRow icon={<EmailIcon/>} label={t.contracts.email} value={contract?.st_email}/>
                          <Divider/>
                          <InfoRow icon={<MoneyIcon/>} label={t.contracts.stRIB} value={contract?.st_rib}/>
                          <Divider/>
                          <InfoRow icon={<MoneyIcon/>} label={t.contracts.stBank} value={contract?.st_banque}/>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* Lot & Type */}
                    <Card elevation={2} sx={{borderRadius: 2}}>
                      <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                          <CategoryIcon color="primary"/>
                          <Typography variant="h6" fontWeight={700}>{t.contracts.lotAndType}</Typography>
                        </Stack>
                        <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                        <Stack spacing={0}>
                          <InfoRow icon={<CategoryIcon/>} label={t.contracts.stLotType}
                                   value={(Array.isArray(contract?.st_lot_type) ? contract.st_lot_type : contract?.st_lot_type ? [contract.st_lot_type] : []).map((c) => resolveLabel(stLotTypeItemsList, c)).join(' / ') || undefined}/>
                          <Divider/>
                          <InfoRow icon={<DescriptionIcon/>} label={t.contracts.stLotDescription}
                                   value={contract?.st_lot_description}/>
                          <Divider/>
                          <InfoRow icon={<MoneyIcon/>} label={t.contracts.stPriceType}
                                   value={(Array.isArray(contract?.st_type_prix) ? contract.st_type_prix : contract?.st_type_prix ? [contract.st_type_prix] : []).map((c) => resolveLabel(stTypePrixItemsList, c)).join(' / ') || undefined}/>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* Financier ST */}
                    <Card elevation={2} sx={{borderRadius: 2}}>
                      <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                          <MoneyIcon color="primary"/>
                          <Typography variant="h6" fontWeight={700}>{t.contracts.financialST}</Typography>
                        </Stack>
                        <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                        <Stack spacing={0}>
                          <InfoRow icon={<PercentIcon/>} label={t.contracts.stRetentionGuarantee}
                                   value={contract?.st_retenue_garantie != null ? `${contract.st_retenue_garantie}%` : undefined}/>
                          <Divider/>
                          <InfoRow icon={<PercentIcon/>} label={t.contracts.stAdvance}
                                   value={contract?.st_avance != null ? `${contract.st_avance}%` : undefined}/>
                          <Divider/>
                          <InfoRow icon={<PercentIcon/>} label={t.contracts.stLatePenaltyRate}
                                   value={contract?.st_penalite_taux != null ? `${contract.st_penalite_taux}‰/jour` : undefined}/>
                          <Divider/>
                          <InfoRow icon={<PercentIcon/>} label={t.contracts.stPenaltyCeiling}
                                   value={contract?.st_plafond_penalite != null ? `${contract.st_plafond_penalite}%` : undefined}/>
                          <Divider/>
                          <InfoRow icon={<TimerIcon/>} label={t.contracts.stPaymentDelay}
                                   value={contract?.st_delai_paiement != null ? `${contract.st_delai_paiement} ${t.contracts.unitDays}` : undefined}/>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* Échéancier ST */}
                    {contract?.st_tranches && contract.st_tranches.length > 0 && (
                      <Card elevation={2} sx={{borderRadius: 2}}>
                        <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                            <PlaylistAddCheckIcon color="primary"/>
                            <Typography variant="h6" fontWeight={700}>{t.contracts.scheduleST}</Typography>
                          </Stack>
                          <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{fontWeight: 700}}>{t.contracts.trancheLabel}</TableCell>
                                  <TableCell sx={{fontWeight: 700}} align="right">{t.contracts.tranchePercentage}</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {contract.st_tranches.map((tr, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{tr.label || `${t.contracts.trancheLabel} ${idx + 1}`}</TableCell>
                                    <TableCell align="right">{tr.pourcentage}%</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Délais & Garantie ST */}
                    <Card elevation={2} sx={{borderRadius: 2}}>
                      <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                          <TimerIcon color="primary"/>
                          <Typography variant="h6" fontWeight={700}>{t.contracts.stDelaysWarranties}</Typography>
                        </Stack>
                        <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                        <Stack spacing={0}>
                          <InfoRow icon={<TimerIcon/>} label={t.contracts.stExecutionDelay}
                                   value={contract?.st_delai_val != null ? `${contract.st_delai_val} ${resolveLabel(stDelaiUnitItemsList, contract?.st_delai_unit)}` : undefined}/>
                          <Divider/>
                          <InfoRow icon={<ShieldIcon/>} label={t.contracts.warranty}
                                   value={contract?.st_garantie_mois != null ? `${contract.st_garantie_mois} ${t.contracts.unitMonths}` : undefined}/>
                          <Divider/>
                          <InfoRow icon={<TimerIcon/>} label={t.contracts.stReserveDelay}
                                   value={contract?.st_delai_reserves != null ? `${contract.st_delai_reserves} ${t.contracts.unitDays}` : undefined}/>
                          <Divider/>
                          <InfoRow icon={<GavelIcon/>} label={t.contracts.stFormalNoticeDelay}
                                   value={contract?.st_delai_med != null ? `${contract.st_delai_med} ${t.contracts.unitDays}` : undefined}/>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* Clauses actives ST */}
                    {contract?.st_clauses_actives && contract.st_clauses_actives.length > 0 && (
                      <Card elevation={2} sx={{borderRadius: 2}}>
                        <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                            <GavelIcon color="primary"/>
                            <Typography variant="h6" fontWeight={700}>{t.contracts.activeClausesST}</Typography>
                          </Stack>
                          <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                          <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                            {contract.st_clauses_actives.map((clause, idx) => {
                              const clauseItem = stClausesActivesList.find((c) => c.key === clause);
                              return (
                                <Chip key={idx} label={clauseItem?.label ?? clause} color="secondary" variant="outlined"
                                      size="small"/>
                              );
                            })}
                          </Box>
                        </CardContent>
                      </Card>
                    )}

                    {/* Observations ST */}
                    {contract?.st_observations && (
                      <Card elevation={2} sx={{borderRadius: 2}}>
                        <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                            <NotesIcon color="primary"/>
                            <Typography variant="h6" fontWeight={700}>{t.contracts.stObservations}</Typography>
                          </Stack>
                          <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                          <Typography>{contract.st_observations}</Typography>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {/* ── Blueline-specific sections ── */}
                {isBlueline && (
                  <>
                    {/* Client (Blueline extra) */}
                    <Card elevation={2} sx={{borderRadius: 2}}>
                      <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                          <PersonIcon color="primary"/>
                          <Typography variant="h6" fontWeight={700}>
                            {t.contracts.clientBlueline}
                          </Typography>
                        </Stack>
                        <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                        <Stack spacing={0}>
                          <InfoRow icon={<CityIcon/>} label={t.contracts.clientCity} value={contract?.client_ville}/>
                          <Divider/>
                          <InfoRow icon={<HomeIcon/>} label={t.contracts.clientPostalCode} value={contract?.client_cp}/>
                          <Divider/>
                          <InfoRow icon={<CityIcon/>} label={t.contracts.constructionCity} value={contract?.chantier_ville}/>
                          <Divider/>
                          <InfoRow icon={<ApartmentIcon/>} label={t.contracts.constructionFloor} value={contract?.chantier_etage}/>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* Prestations */}
                    {contract?.prestations && contract.prestations.length > 0 && (
                      <Card elevation={2} sx={{borderRadius: 2}}>
                        <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                            <ListAltIcon color="primary"/>
                            <Typography variant="h6" fontWeight={700}>
                              {t.contracts.prestations}
                            </Typography>
                          </Stack>
                          <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{fontWeight: 700}}>{t.contracts.prestationName}</TableCell>
                                  <TableCell sx={{fontWeight: 700}}>{t.contracts.prestationDescription}</TableCell>
                                  <TableCell sx={{fontWeight: 700}} align="right">{t.contracts.prestationQuantity}</TableCell>
                                  <TableCell sx={{fontWeight: 700}}>{t.contracts.prestationUnit}</TableCell>
                                  <TableCell sx={{fontWeight: 700}} align="right">{t.contracts.prestationUnitPrice}</TableCell>
                                  <TableCell sx={{fontWeight: 700}} align="right">{t.contracts.prestationTotal}</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {contract.prestations.map((p, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{resolveLabel(prestationNomItemsList, p.nom)}</TableCell>
                                    <TableCell>{p.description || '-'}</TableCell>
                                    <TableCell align="right">{p.quantite}</TableCell>
                                    <TableCell>{resolveLabel(prestationUniteItemsList, p.unite)}</TableCell>
                                    <TableCell
                                      align="right">{Number(p.prix_unitaire).toLocaleString('fr-MA')}</TableCell>
                                    <TableCell
                                      align="right">{(p.quantite * p.prix_unitaire).toLocaleString('fr-MA')}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Fournitures & Eau/Électricité */}
                    <Card elevation={2} sx={{borderRadius: 2}}>
                      <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                          <PlumbingIcon color="primary"/>
                          <Typography variant="h6" fontWeight={700}>
                              {t.contracts.suppliesAndWater}
                          </Typography>
                        </Stack>
                        <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                        <Stack spacing={0}>
                          <InfoRow icon={<PlumbingIcon/>} label={t.contracts.supplies}
                                   value={resolveLabel(fournituresItemsList, contract?.fournitures)}/>
                          <Divider/>
                          <InfoRow icon={<DescriptionIcon/>} label={t.contracts.materialsDetail}
                                   value={contract?.materiaux_detail}/>
                          <Divider/>
                          <InfoRow icon={<WaterIcon/>} label={t.contracts.waterElectricity}
                                   value={resolveLabel(eauElectriciteItemsList, contract?.eau_electricite)}/>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* Garantie (Blueline) */}
                    <Card elevation={2} sx={{borderRadius: 2}}>
                      <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                          <ShieldIcon color="primary"/>
                          <Typography variant="h6" fontWeight={700}>
                              {t.contracts.warrantySection}
                          </Typography>
                        </Stack>
                        <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                        <Stack spacing={0}>
                          <InfoRow
                            icon={<TimerIcon/>}
                            label={t.contracts.duration}
                            value={
                              contract?.garantie_nb != null
                                ? `${contract.garantie_nb} ${resolveLabel(garantieUniteItemsList, contract?.garantie_unite)}`
                                : undefined
                            }
                          />
                          <Divider/>
                          <InfoRow icon={<ShieldIcon/>} label={t.contracts.warrantyType}
                                   value={resolveLabel(garantieTypeItemsList, contract?.garantie_type)}/>
                          <Divider/>
                          <InfoRow icon={<DescriptionIcon/>} label={t.contracts.warrantyExclusions} value={contract?.exclusions_garantie}/>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* Échéancier & Résiliation */}
                    <Card elevation={2} sx={{borderRadius: 2}}>
                      <CardContent sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 3}}}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                          <PercentIcon color="primary"/>
                          <Typography variant="h6" fontWeight={700}>
                              {t.contracts.scheduleTermination}
                          </Typography>
                        </Stack>
                        <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                        <Stack spacing={0}>
                          <InfoRow icon={<PercentIcon/>} label={t.contracts.deposit}
                                   value={contract?.acompte != null ? `${contract.acompte}%` : undefined}/>
                          <Divider/>
                          <InfoRow icon={<PercentIcon/>} label={t.contracts.tranche2}
                                   value={contract?.tranche2 != null ? `${contract.tranche2}%` : undefined}/>
                          <Divider/>
                          <InfoRow icon={<PercentIcon/>} label={t.contracts.balance}
                                   value={contract?.solde != null ? `${contract.solde}%` : undefined}/>
                          <Divider/>
                          <InfoRow icon={<GavelIcon/>} label={t.contracts.terminationClause}
                                   value={resolveLabel(clauseResiliationItemsList, contract?.clause_resiliation)}/>
                          <Divider/>
                          <InfoRow icon={<NotesIcon/>} label={t.contracts.notes} value={contract?.notes}/>
                        </Stack>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* ── Meta / Audit info ── */}
                <Card elevation={2} sx={{borderRadius: 2}}>
                  <CardContent sx={{p: 3}}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                      <DescriptionIcon color="primary"/>
                      <Typography variant="h6" fontWeight={700}>
                        {t.contracts.systemInfo}
                      </Typography>
                    </Stack>
                    <Divider sx={{mb: {xs: 1.5, md: 2}}}/>
                    <Stack spacing={0}>
                      <InfoRow
                        icon={<CalendarTodayIcon/>}
                        label={t.contracts.creationDate}
                        value={formatDate(contract?.date_created ?? null)}
                      />
                      <Divider/>
                      <InfoRow
                        icon={<CalendarTodayIcon/>}
                        label={t.contracts.lastUpdate}
                        value={formatDate(contract?.date_updated ?? null)}
                      />
                      <Divider/>
                      <InfoRow icon={<PersonIcon/>} label={t.contracts.createdBy} value={contract?.created_by_user_name}/>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            )}
          </Stack>
        </Protected>
      </NavigationBar>
      {showDeleteModal && (
        <ActionModals
          title={t.contracts.deleteContract}
          body={t.contracts.deleteContractIrreversible}
          actions={deleteModalActions}
          titleIcon={<DeleteIcon/>}
          titleIconColor="#D32F2F"
        />
      )}
      {showLanguageModal && (
        <PdfLanguageModal
          onSelectLanguage={handleLanguageSelect}
          onClose={() => {
            setShowLanguageModal(false);
            setPendingDocFormat(null);
          }}
        />
      )}
    </Stack>
  );
};

export default ContractViewClient;

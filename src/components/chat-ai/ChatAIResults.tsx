import { useState } from 'react';
import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { DeleteOutlined, EditOutlined, OpenInNew, PictureAsPdfOutlined } from '@mui/icons-material';
import { useLanguage } from '@/utils/hooks';
import { createContractStatutFilterOptions } from '@/utils/rawData';
import TextButton from '@/components/htmlElements/buttons/textButton/textButton';
import ActionModals from '@/components/htmlElements/modals/actionModal/actionModals';
import styles from './shared/chat-ai.module.css';
import type { ChatCard, NavigationTarget } from './types';

const resources: Record<string, [string, string]> = {
	contract: ['Contrat', 'Contract'],
	project: ['Projet', 'Project'],
	user: ['Utilisateur', 'User'],
};
const fields: Record<string, [string, string]> = {
	client_nom: ['Nom du client', 'Client name'],
	client_tel: ['Téléphone', 'Phone'],
	client_email: ['Email', 'Email'],
	adresse_travaux: ['Adresse des travaux', 'Work address'],
	description_travaux: ['Description des travaux', 'Work description'],
	date_debut: ['Date de début', 'Start date'],
	duree_estimee: ['Durée estimée', 'Estimated duration'],
	notes: ['Notes', 'Notes'],
	st_lot_description: ['Description du lot', 'Lot description'],
	st_observations: ['Observations', 'Observations'],
	name: ['Nom du projet', 'Project name'],
	description: ['Description', 'Description'],
	adresse: ['Adresse du projet', 'Project address'],
	maitre_ouvrage: ['Maître d’ouvrage', 'Project owner'],
	permis: ['N° permis de construire', 'Building permit'],
};
const editable: Record<string, string[]> = {
	contract: [
		'client_nom',
		'client_tel',
		'client_email',
		'adresse_travaux',
		'description_travaux',
		'date_debut',
		'duree_estimee',
		'notes',
		'st_lot_description',
		'st_observations',
	],
	project: ['name', 'description', 'adresse', 'maitre_ouvrage', 'permis'],
};
export const validConfirmation = (card: ChatCard) => {
	if (
		card.type !== 'confirmation' ||
		![1, 2].includes(card.company_id ?? 0) ||
		!card.action_id ||
		!Number.isSafeInteger(card.record_id) ||
		card.record_id! < 1 ||
		!Object.hasOwn(editable, card.resource ?? '')
	)
		return false;
	const changes = card.changes ?? {};
	if (typeof changes !== 'object' || Array.isArray(changes)) return false;
	const keys = Object.keys(changes);
	if (card.operation === 'delete') return keys.length === 0;
	return (
		card.operation === 'update' &&
		keys.length > 0 &&
		keys.every(
			(key) => editable[card.resource!].includes(key) && (typeof changes[key] === 'string' || changes[key] === null),
		)
	);
};
type Props = {
	cards: ChatCard[];
	navigate: (target: NavigationTarget) => void;
	confirm?: (card: ChatCard) => Promise<void>;
	pdf?: (id: number, format?: 'pdf' | 'docx', language?: 'fr' | 'en') => void;
	select?: (resource: string, identifier: number, operation: 'edit' | 'delete') => void;
	permissions?: { can_update: boolean; can_delete: boolean; can_print: boolean };
};
export const ChatAIResults = ({ cards, navigate, confirm, pdf, select, permissions }: Props) => {
	const { language, t } = useLanguage();
	const contractStatuses = createContractStatutFilterOptions(t);
	const en = language === 'en';
	const index = en ? 1 : 0;
	const [pending, setPending] = useState<ChatCard | null>(null);
	const [sending, setSending] = useState(false);
	const [done, setDone] = useState<Set<string>>(new Set());
	const action = async () => {
		if (!pending || !confirm || sending || !validConfirmation(pending)) return;
		setSending(true);
		try {
			await confirm(pending);
			setDone((old) => new Set(old).add(pending.action_id!));
			setPending(null);
		} finally {
			setSending(false);
		}
	};
	const label = (resource?: string) => resources[resource ?? '']?.[index] ?? (en ? 'Record' : 'Document');
	const amount = (value?: string) =>
		value === undefined
			? ''
			: new Intl.NumberFormat(en ? 'en-GB' : 'fr-FR', { maximumFractionDigits: 2 }).format(Number(value));
	if (!cards.length) return null;
	return (
		<Stack spacing={1.5}>
			{cards.map((card, i) => (
				<Box key={i}>
					{card.items && (
						<>
							<Typography variant="caption" color="text.secondary">
								{card.items.length
									? `${card.items.length} ${en ? 'result(s)' : 'résultat(s)'}`
									: en
										? 'No matching result. Refine your search.'
										: 'Aucun résultat trouvé. Précisez votre recherche.'}
							</Typography>
							{card.items.map((record) => (
								<Paper key={record.id} variant="outlined" className={styles.result}>
									<Typography variant="caption" color="text.secondary">
										{label(card.resource)}
									</Typography>
									<Stack direction="row" sx={{ gap: 1, justifyContent: 'space-between', flexWrap: 'wrap' }}>
										<Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
											{record.name}
										</Typography>
										{record.status && (
											<Chip
												size="small"
												variant="outlined"
												label={
													card.resource === 'contract'
														? (contractStatuses.find((status) => status.value === record.status)?.label ??
															record.status)
														: record.status
												}
											/>
										)}
									</Stack>
									{record.project && (
										<Typography variant="body2">
											{en ? 'Project' : 'Projet'} : {record.project}
										</Typography>
									)}
									{record.client && (
										<Typography variant="body2">
											{en ? 'Customer' : 'Client'} : {record.client}
										</Typography>
									)}
									{record.supplier && (
										<Typography variant="body2">
											{en ? 'Supplier' : 'Fournisseur'} : {record.supplier}
										</Typography>
									)}
									{record.description && (
										<Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
											{record.description}
										</Typography>
									)}
									{record.date && (
										<Typography variant="caption" color="text.secondary">
											{record.date}
										</Typography>
									)}
									{record.amount !== undefined && (
										<Typography variant="body2" sx={{ fontWeight: 600 }}>
											{amount(record.amount)} {record.currency}
										</Typography>
									)}
									{record.details?.map((detail) => (
										<Typography key={detail.label} variant="body2">
											{en ? detail.label_en : detail.label} : {detail.value}
										</Typography>
									))}
									<Divider sx={{ my: 1 }} />
									<Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
										{record.navigation && (
											<TextButton
												cssClass={styles.resultAction}
												buttonText={en ? 'Open' : 'Voir'}
												startIcon={<OpenInNew fontSize="small" />}
												onClick={() => navigate(record.navigation!)}
											/>
										)}
										{permissions?.can_update &&
											record.can_update !== false &&
											select &&
											['contract', 'project'].includes(card.resource ?? '') && (
												<TextButton
													cssClass={styles.resultAction}
													buttonText={en ? 'Edit' : 'Modifier'}
													startIcon={<EditOutlined fontSize="small" />}
													onClick={() => select(card.resource!, record.id, 'edit')}
												/>
											)}
										{permissions?.can_delete &&
											record.can_delete !== false &&
											select &&
											Object.hasOwn(editable, card.resource ?? '') && (
												<TextButton
													cssClass={styles.resultAction}
													buttonText={en ? 'Delete' : 'Supprimer'}
													startIcon={<DeleteOutlined fontSize="small" />}
													onClick={() => select(card.resource!, record.id, 'delete')}
												/>
											)}
										{permissions?.can_print && card.resource === 'contract' && pdf && (
											<TextButton
												cssClass={styles.resultAction}
												buttonText="PDF"
												startIcon={<PictureAsPdfOutlined fontSize="small" />}
												onClick={() => pdf(record.id, 'pdf', language)}
											/>
										)}
									</Stack>
								</Paper>
							))}
							{card.has_more && (
								<Typography variant="caption">
									{en
										? 'More results exist. Refine your search.'
										: 'D’autres résultats existent. Précisez votre recherche.'}
								</Typography>
							)}
						</>
					)}
					{card.type === 'confirmation_status' && <Typography variant="body2">{card.message}</Typography>}
					{card.type === 'confirmation' && (
						<Paper variant="outlined" className={styles.result}>
							<Typography variant="body2" sx={{ fontWeight: 600 }}>
								{card.operation === 'delete' ? (en ? 'Delete' : 'Supprimer') : en ? 'Edit' : 'Modifier'}{' '}
								{label(card.resource)} : {card.label}
							</Typography>
							{validConfirmation(card) &&
								Object.keys(card.changes ?? {}).map((key) => (
									<Typography key={key} variant="body2">
										{fields[key]?.[index]} : {card.before?.[key] ?? '—'} → {card.changes?.[key] ?? '—'}
									</Typography>
								))}
							<TextButton
								cssClass={styles.resultAction}
								buttonText={
									done.has(card.action_id!)
										? en
											? 'Action completed'
											: 'Action effectuée'
										: en
											? 'Review this action'
											: 'Vérifier cette action'
								}
								disabled={!validConfirmation(card) || !confirm || done.has(card.action_id!)}
								onClick={() => setPending(card)}
							/>
						</Paper>
					)}
					{card.type === 'pdf' && card.record_id && (
						<TextButton
							buttonText={`${en ? 'Download contract' : 'Télécharger le contrat'} ${card.format === 'docx' ? 'Word' : 'PDF'}`}
							onClick={() => pdf?.(card.record_id!, card.format ?? 'pdf', card.language ?? language)}
						/>
					)}
					{card.target && (
						<TextButton
							cssClass={styles.resultAction}
							buttonText={en ? 'Open page' : 'Ouvrir la page'}
							onClick={() => navigate(card.target!)}
						/>
					)}
					{card.documents?.map((doc) => (
						<Typography key={doc.document_id} variant="caption" color="text.secondary">
							Source : {doc.title}
						</Typography>
					))}
				</Box>
			))}
			{pending && (
				<ActionModals
					title={`${pending.operation === 'delete' ? (en ? 'Delete' : 'Supprimer') : en ? 'Edit' : 'Modifier'} ${pending.label}`}
					body={pending.warning}
					onClose={() => {
						if (!sending) setPending(null);
					}}
					actions={[
						{ text: en ? 'Cancel' : 'Annuler', active: false, disabled: sending, onClick: () => setPending(null) },
						{
							text: sending ? (en ? 'Sending…' : 'En cours…') : en ? 'Confirm this action' : 'Confirmer cette action',
							active: true,
							disabled: sending || !validConfirmation(pending),
							color: pending.operation === 'delete' ? '#C62828' : '#0274D7',
							onClick: () => {
								void action().catch(() => {});
							},
						},
					]}
				>
					{Object.keys(pending.changes ?? {})
						.filter((key) => Object.hasOwn(fields, key))
						.map((key) => (
							<Typography key={key} variant="body2">
								{fields[key][index]} : {pending.before?.[key] ?? '—'} → {pending.changes?.[key] ?? '—'}
							</Typography>
						))}
				</ActionModals>
			)}
		</Stack>
	);
};

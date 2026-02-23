'use client';

import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Button,
	TextField,
	Paper,
	Stack,
	MenuItem,
	CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { CONTRACTS_LIST, CONTRACTS_VIEW } from '@/utils/routes';
import { useAddContractMutation, useEditContractMutation, useGetContractQuery } from '@/store/services/contract';

interface Props {
	id?: number;
}

const defaultForm = {
	numero_contrat: '',
	date_contrat: '',
	statut: 'Brouillon',
	type_contrat: 'travaux_finition',
	ville_signature: 'Tanger',
	client_nom: '',
	client_cin: '',
	client_qualite: '',
	client_adresse: '',
	client_tel: '',
	client_email: '',
	type_bien: '',
	surface: '',
	adresse_travaux: '',
	date_debut: '',
	duree_estimee: '',
	description_travaux: '',
	montant_ht: '',
	devise: 'MAD',
	tva: '20',
	garantie: '1 an',
	tribunal: 'Tanger',
	responsable_projet: '',
	confidentialite: 'CONFIDENTIEL',
};

const ContractFormClient = ({ id }: Props) => {
	const router = useRouter();
	const isEditMode = id !== undefined;

	const { data: contract, isLoading: isLoadingContract } = useGetContractQuery(
		{ id: id! },
		{ skip: !isEditMode },
	);

	const [addContract, { isLoading: isAdding }] = useAddContractMutation();
	const [editContract, { isLoading: isEditing }] = useEditContractMutation();

	const [form, setForm] = useState(defaultForm);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (contract) {
			setForm({
				numero_contrat: contract.numero_contrat ?? '',
				date_contrat: contract.date_contrat ?? '',
				statut: contract.statut ?? 'Brouillon',
				type_contrat: contract.type_contrat ?? 'travaux_finition',
				ville_signature: contract.ville_signature ?? 'Tanger',
				client_nom: contract.client_nom ?? '',
				client_cin: contract.client_cin ?? '',
				client_qualite: contract.client_qualite ?? '',
				client_adresse: contract.client_adresse ?? '',
				client_tel: contract.client_tel ?? '',
				client_email: contract.client_email ?? '',
				type_bien: contract.type_bien ?? '',
				surface: contract.surface != null ? String(contract.surface) : '',
				adresse_travaux: contract.adresse_travaux ?? '',
				date_debut: contract.date_debut ?? '',
				duree_estimee: contract.duree_estimee ?? '',
				description_travaux: contract.description_travaux ?? '',
				montant_ht: contract.montant_ht != null ? String(contract.montant_ht) : '',
				devise: contract.devise ?? 'MAD',
				tva: contract.tva != null ? String(contract.tva) : '20',
				garantie: contract.garantie ?? '1 an',
				tribunal: contract.tribunal ?? 'Tanger',
				responsable_projet: contract.responsable_projet ?? '',
				confidentialite: contract.confidentialite ?? 'CONFIDENTIEL',
			});
		}
	}, [contract]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const payload = {
			...form,
			montant_ht: form.montant_ht ? parseFloat(form.montant_ht) : undefined,
			surface: form.surface ? parseFloat(form.surface) : undefined,
		};

		try {
			if (isEditMode) {
				await editContract({ id: id!, data: payload }).unwrap();
				router.push(CONTRACTS_VIEW(id!));
			} else {
				const result = await addContract({ data: payload }).unwrap();
				router.push(CONTRACTS_VIEW(result.id));
			}
		} catch {
			setError(
				isEditMode
					? 'Une erreur est survenue lors de la mise à jour du contrat.'
					: 'Une erreur est survenue lors de la création du contrat.',
			);
		}
	};

	const isLoading = isAdding || isEditing;

	if (isEditMode && isLoadingContract) {
		return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
	}

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h5" fontWeight={700} gutterBottom>
				{isEditMode ? 'Modifier le contrat' : 'Nouveau contrat'}
			</Typography>

			<Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
				<Stack spacing={3}>
					{error && <Typography color="error">{error}</Typography>}

					{/* Identification */}
					<Typography variant="subtitle1" fontWeight={700}>Identification</Typography>
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<TextField label="Numéro de contrat" name="numero_contrat" value={form.numero_contrat} onChange={handleChange} required fullWidth />
						<TextField label="Date du contrat" name="date_contrat" type="date" value={form.date_contrat} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
					</Stack>
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<TextField select label="Statut" name="statut" value={form.statut} onChange={handleChange} fullWidth>
							<MenuItem value="Brouillon">Brouillon</MenuItem>
							<MenuItem value="Envoyé">Envoyé</MenuItem>
							<MenuItem value="Signé">Signé</MenuItem>
							<MenuItem value="En cours">En cours</MenuItem>
							<MenuItem value="Terminé">Terminé</MenuItem>
							<MenuItem value="Annulé">Annulé</MenuItem>
							<MenuItem value="Expiré">Expiré</MenuItem>
						</TextField>
						<TextField select label="Type de contrat" name="type_contrat" value={form.type_contrat} onChange={handleChange} fullWidth>
							<MenuItem value="travaux_finition">Travaux de finition</MenuItem>
							<MenuItem value="travaux_gros_oeuvre">Travaux gros œuvre</MenuItem>
							<MenuItem value="design_interieur">Design intérieur</MenuItem>
							<MenuItem value="cle_en_main">Clé en main</MenuItem>
							<MenuItem value="ameublement">Ameublement</MenuItem>
							<MenuItem value="maintenance">Maintenance</MenuItem>
							<MenuItem value="suivi_chantier">Suivi de chantier</MenuItem>
						</TextField>
						<TextField label="Ville de signature" name="ville_signature" value={form.ville_signature} onChange={handleChange} fullWidth />
					</Stack>

					{/* Client */}
					<Typography variant="subtitle1" fontWeight={700}>Client</Typography>
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<TextField label="Nom du client" name="client_nom" value={form.client_nom} onChange={handleChange} required fullWidth />
						<TextField label="CIN / N° entreprise" name="client_cin" value={form.client_cin} onChange={handleChange} fullWidth />
						<TextField label="Qualité" name="client_qualite" value={form.client_qualite} onChange={handleChange} fullWidth />
					</Stack>
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<TextField label="Téléphone" name="client_tel" value={form.client_tel} onChange={handleChange} fullWidth />
						<TextField label="Email" name="client_email" type="email" value={form.client_email} onChange={handleChange} fullWidth />
						<TextField label="Adresse" name="client_adresse" value={form.client_adresse} onChange={handleChange} fullWidth />
					</Stack>

					{/* Travaux */}
					<Typography variant="subtitle1" fontWeight={700}>Travaux</Typography>
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<TextField label="Type de bien" name="type_bien" value={form.type_bien} onChange={handleChange} fullWidth />
						<TextField label="Surface (m²)" name="surface" type="number" value={form.surface} onChange={handleChange} fullWidth />
						<TextField label="Adresse des travaux" name="adresse_travaux" value={form.adresse_travaux} onChange={handleChange} fullWidth />
					</Stack>
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<TextField label="Date de début" name="date_debut" type="date" value={form.date_debut} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
						<TextField label="Durée estimée" name="duree_estimee" value={form.duree_estimee} onChange={handleChange} fullWidth />
						<TextField label="Responsable projet" name="responsable_projet" value={form.responsable_projet} onChange={handleChange} fullWidth />
					</Stack>
					<TextField label="Description des travaux" name="description_travaux" value={form.description_travaux} onChange={handleChange} multiline rows={3} fullWidth />

					{/* Financier */}
					<Typography variant="subtitle1" fontWeight={700}>Financier</Typography>
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<TextField label="Montant HT" name="montant_ht" type="number" value={form.montant_ht} onChange={handleChange} required fullWidth />
						<TextField select label="Devise" name="devise" value={form.devise} onChange={handleChange} fullWidth>
							<MenuItem value="MAD">MAD</MenuItem>
							<MenuItem value="EUR">EUR</MenuItem>
							<MenuItem value="USD">USD</MenuItem>
						</TextField>
						<TextField label="TVA (%)" name="tva" value={form.tva} onChange={handleChange} fullWidth />
					</Stack>

					{/* Clauses */}
					<Typography variant="subtitle1" fontWeight={700}>Clauses</Typography>
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<TextField label="Garantie" name="garantie" value={form.garantie} onChange={handleChange} fullWidth />
						<TextField label="Tribunal compétent" name="tribunal" value={form.tribunal} onChange={handleChange} fullWidth />
						<TextField select label="Confidentialité" name="confidentialite" value={form.confidentialite} onChange={handleChange} fullWidth>
							<MenuItem value="CONFIDENTIEL">CONFIDENTIEL</MenuItem>
							<MenuItem value="USAGE INTERNE">USAGE INTERNE</MenuItem>
							<MenuItem value="STANDARD">STANDARD</MenuItem>
						</TextField>
					</Stack>

					<Stack direction="row" spacing={2} justifyContent="flex-end">
						<Button variant="outlined" onClick={() => router.push(isEditMode ? CONTRACTS_VIEW(id!) : CONTRACTS_LIST)}>
							Annuler
						</Button>
						<Button type="submit" variant="contained" disabled={isLoading}
							startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}>
							{isLoading
								? (isEditMode ? 'Sauvegarde...' : 'Création...')
								: (isEditMode ? 'Enregistrer' : 'Créer le contrat')}
						</Button>
					</Stack>
				</Stack>
			</Paper>
		</Box>
	);
};

export default ContractFormClient;

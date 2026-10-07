// Only reviewed writing fields get AI. Unknown fields stay unchanged by default.
const writingFields = new Set([
	'description_travaux',
	'conditions_acces',
	'clause_spec',
	'exclusions',
	'annexes',
	'st_qualite',
	'st_lot_description',
	'st_observations',
	'materiaux_detail',
	'exclusions_garantie',
	'notes',
]);

export const isAiTextField = (name: string, type: string) =>
	(type === 'text' || type === 'textarea') &&
	(writingFields.has(name) || /^(prestations\.\d+\.description|(?:st_)?tranches\.\d+\.label)$/.test(name));

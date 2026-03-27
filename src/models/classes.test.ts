import {ContractClass, UserClass} from './classes';

// ─── UserClass ───────────────────────────────────────────────────────────────

describe('UserClass', () => {
  const makeUser = (overrides?: Partial<ConstructorParameters<typeof UserClass>>) => {
    const args: ConstructorParameters<typeof UserClass> = [
      1,                   // id
      'John',              // first_name
      'Doe',               // last_name
      'john@example.com',  // email
      'Homme',             // gender
      null,                // avatar
      null,                // avatar_cropped
      false,               // is_staff
      true,                // is_active
      false,               // default_password_set
      '2024-01-01',        // date_joined
      '2024-06-01',        // date_updated
      '2024-05-31',        // last_login
      true,                // can_view
      false,               // can_print
      true,                // can_create
      false,               // can_edit
      false,               // can_delete
    ];
    if (overrides) {
      overrides.forEach((v, i) => {
        if (v !== undefined) (args as unknown[])[i] = v;
      });
    }
    return new UserClass(...args);
  };

  it('creates a UserClass instance with all properties', () => {
    const user = makeUser();
    expect(user.id).toBe(1);
    expect(user.first_name).toBe('John');
    expect(user.last_name).toBe('Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.gender).toBe('Homme');
    expect(user.avatar).toBeNull();
    expect(user.avatar_cropped).toBeNull();
    expect(user.is_staff).toBe(false);
    expect(user.is_active).toBe(true);
    expect(user.default_password_set).toBe(false);
    expect(user.date_joined).toBe('2024-01-01');
    expect(user.date_updated).toBe('2024-06-01');
    expect(user.last_login).toBe('2024-05-31');
  });

  it('stores permission flags correctly', () => {
    const user = makeUser();
    expect(user.can_view).toBe(true);
    expect(user.can_print).toBe(false);
    expect(user.can_create).toBe(true);
    expect(user.can_edit).toBe(false);
    expect(user.can_delete).toBe(false);
  });

  it('allows mutating non-readonly properties', () => {
    const user = makeUser();
    user.first_name = 'Jane';
    expect(user.first_name).toBe('Jane');
  });

  it('creates a staff user with all permissions', () => {
    const user = new UserClass(
      2, 'Admin', 'User', 'admin@example.com', 'Femme',
      null, null,
      true, true, false,
      '2023-01-01', '2024-01-01', '2024-01-01',
      true, true, true, true, true,
    );
    expect(user.is_staff).toBe(true);
    expect(user.can_view).toBe(true);
    expect(user.can_print).toBe(true);
    expect(user.can_create).toBe(true);
    expect(user.can_edit).toBe(true);
    expect(user.can_delete).toBe(true);
  });
});

// ─── ContractClass ───────────────────────────────────────────────────────────

describe('ContractClass', () => {
  const makeContract = () =>
    new ContractClass(
      // Meta identifiers
      1,                          // id
      'CTR-2024-001',             // numero_contrat
      'Dupont SAS',               // client_name

      // Company
      'casa_di_lusso',            // company
      'Casa di Lusso',            // company_display (readonly)
      'standard',                 // contract_category
      'Standard',                 // contract_category_display (readonly)

      // Client embedded fields
      'Dupont Jean',              // client_nom
      'AB123456',                 // client_cin
      'Maitre',                   // client_qualite
      '10 Rue de la Paix, Paris', // client_adresse
      '+33 6 12 34 56 78',        // client_tel
      'dupont@example.com',       // client_email
      'Paris',                    // ville_signature

      // Contract dates & status
      '2024-03-15',               // date_contrat
      'En cours',                 // statut
      '12 Boulevard Haussmann',   // adresse_travaux
      'Appartement',              // type_bien
      120,                        // surface
      ['Maçonnerie', 'Peinture'], // services
      'Rénovation complète',      // description_travaux
      '2024-04-01',               // date_debut
      '6 mois',                   // duree_estimee
      'Accès libre',              // conditions_acces

      // Financial fields
      50000,                      // montant_ht
      'EUR',                      // devise
      20,                         // tva
      10000,                      // montant_tva (readonly)
      60000,                      // montant_ttc (readonly)
      [],                         // tranches
      'Virement',                 // mode_paiement_texte
      'FR76 1234 5678',           // rib
      30,                         // delai_retard
      0.5,                        // penalite_retard
      1000,                       // frais_redemarrage

      // Clauses
      'Décennale',                // garantie
      30,                         // delai_reserves
      'Paris',                    // tribunal
      [],                         // clauses_actives
      '',                         // clause_spec
      '',                         // exclusions

      // Options
      'Forfait',                  // type_contrat
      'Forfait fixe',             // type_contrat_display (readonly)
      'Pierre Martin',            // responsable_projet
      'Arch. Leblanc',            // architecte
      'Confidentiel',             // confidentialite
      '1.0',                      // version_document
      '',                         // annexes

      // Blueline-specific fields
      '',                         // client_ville
      '',                         // client_cp
      '',                         // chantier_ville
      '',                         // chantier_etage
      null,                       // prestations
      '',                         // fournitures
      '',                         // materiaux_detail
      '',                         // eau_electricite
      null,                       // garantie_nb
      '',                         // garantie_unite
      '',                         // garantie_type
      '',                         // exclusions_garantie
      null,                       // acompte
      null,                       // tranche2
      null,                       // solde (readonly)
      '',                         // clause_resiliation
      '',                         // notes

      // Sous-Traitance (CDL) specific fields
      null,                       // st_projet
      null,                       // st_projet_detail
      '',                         // st_name
      '',                         // st_forme
      '',                         // st_capital
      '',                         // st_rc
      '',                         // st_ice
      '',                         // st_if
      '',                         // st_cnss
      '',                         // st_addr
      '',                         // st_rep
      '',                         // st_cin
      '',                         // st_qualite
      '',                         // st_tel
      '',                         // st_email
      '',                         // st_rib
      '',                         // st_banque
      [],                         // st_lot_type
      '',                         // st_lot_description
      [],                         // st_type_prix
      null,                       // st_retenue_garantie
      null,                       // st_avance
      null,                       // st_penalite_taux
      null,                       // st_plafond_penalite
      null,                       // st_delai_paiement
      [],                         // st_tranches
      null,                       // st_delai_val
      '',                         // st_delai_unit
      null,                       // st_garantie_mois
      null,                       // st_delai_reserves
      null,                       // st_delai_med
      [],                         // st_clauses_actives
      '',                         // st_observations

      // Meta audit
      3,                          // created_by_user (readonly)
      3,                          // created_by_user_id (readonly)
      'Admin User',               // created_by_user_name (readonly)
      '2024-03-10T09:00:00Z',     // date_created (readonly)
      '2024-03-15T14:30:00Z',     // date_updated (readonly)
    );

  it('creates a ContractClass instance with core identifiers', () => {
    const contract = makeContract();
    expect(contract.id).toBe(1);
    expect(contract.numero_contrat).toBe('CTR-2024-001');
    expect(contract.client_name).toBe('Dupont SAS');
  });

  it('stores contract_category fields', () => {
    const contract = makeContract();
    expect(contract.contract_category).toBe('standard');
    expect(contract.contract_category_display).toBe('Standard');
  });

  it('stores client embedded fields', () => {
    const contract = makeContract();
    expect(contract.client_nom).toBe('Dupont Jean');
    expect(contract.client_cin).toBe('AB123456');
    expect(contract.client_qualite).toBe('Maitre');
    expect(contract.client_adresse).toBe('10 Rue de la Paix, Paris');
    expect(contract.client_tel).toBe('+33 6 12 34 56 78');
    expect(contract.client_email).toBe('dupont@example.com');
    expect(contract.ville_signature).toBe('Paris');
  });

  it('stores contract dates and status', () => {
    const contract = makeContract();
    expect(contract.date_contrat).toBe('2024-03-15');
    expect(contract.statut).toBe('En cours');
  });

  it('stores financial fields', () => {
    const contract = makeContract();
    expect(contract.montant_ht).toBe(50000);
    expect(contract.devise).toBe('EUR');
    expect(contract.tva).toBe(20);
    expect(contract.montant_tva).toBe(10000);
    expect(contract.montant_ttc).toBe(60000);
  });

  it('stores project fields', () => {
    const contract = makeContract();
    expect(contract.adresse_travaux).toBe('12 Boulevard Haussmann');
    expect(contract.type_bien).toBe('Appartement');
    expect(contract.surface).toBe(120);
    expect(contract.services).toEqual(['Maçonnerie', 'Peinture']);
  });

  it('stores readonly meta audit fields', () => {
    const contract = makeContract();
    expect(contract.created_by_user).toBe(3);
    expect(contract.created_by_user_name).toBe('Admin User');
    expect(contract.date_created).toBe('2024-03-10T09:00:00Z');
    expect(contract.date_updated).toBe('2024-03-15T14:30:00Z');
  });

  it('allows mutating mutable fields', () => {
    const contract = makeContract();
    contract.numero_contrat = 'CTR-2024-002';
    expect(contract.numero_contrat).toBe('CTR-2024-002');
  });

  it('initialises ST fields to defaults', () => {
    const contract = makeContract();
    expect(contract.st_projet).toBeNull();
    expect(contract.st_projet_detail).toBeNull();
    expect(contract.st_name).toBe('');
    expect(contract.st_forme).toBe('');
    expect(contract.st_lot_type).toEqual([]);
    expect(contract.st_type_prix).toEqual([]);
    expect(contract.st_retenue_garantie).toBeNull();
    expect(contract.st_avance).toBeNull();
    expect(contract.st_penalite_taux).toBeNull();
    expect(contract.st_plafond_penalite).toBeNull();
    expect(contract.st_delai_paiement).toBeNull();
    expect(contract.st_tranches).toEqual([]);
    expect(contract.st_delai_val).toBeNull();
    expect(contract.st_delai_unit).toBe('');
    expect(contract.st_garantie_mois).toBeNull();
    expect(contract.st_delai_reserves).toBeNull();
    expect(contract.st_delai_med).toBeNull();
    expect(contract.st_clauses_actives).toEqual([]);
    expect(contract.st_observations).toBe('');
  });

  it('allows mutating ST fields', () => {
    const contract = makeContract();
    contract.st_name = 'Sub Corp SARL';
    contract.st_lot_type = ['gros_oeuvre'];
    contract.st_type_prix = ['forfaitaire'];
    contract.contract_category = 'sous_traitance';

    expect(contract.st_name).toBe('Sub Corp SARL');
    expect(contract.st_lot_type).toEqual(['gros_oeuvre']);
    expect(contract.st_type_prix).toEqual(['forfaitaire']);
    expect(contract.contract_category).toBe('sous_traitance');
  });

  it('stores ST identity text fields', () => {
    const contract = makeContract();
    // All identity fields should be empty strings by default
    expect(contract.st_capital).toBe('');
    expect(contract.st_rc).toBe('');
    expect(contract.st_ice).toBe('');
    expect(contract.st_if).toBe('');
    expect(contract.st_cnss).toBe('');
    expect(contract.st_addr).toBe('');
    expect(contract.st_rep).toBe('');
    expect(contract.st_cin).toBe('');
    expect(contract.st_qualite).toBe('');
    expect(contract.st_tel).toBe('');
    expect(contract.st_email).toBe('');
    expect(contract.st_rib).toBe('');
    expect(contract.st_banque).toBe('');
    expect(contract.st_lot_description).toBe('');
    expect(contract.st_observations).toBe('');
  });
});

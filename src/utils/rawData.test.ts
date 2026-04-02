import {
  deviseItemsList,
  getContractStatusColor,
  getTranslatedRawData,
} from './rawData';
import {fr} from '@/translations/fr';

const rawData = getTranslatedRawData(fr);
const {
  confidentialiteItemsList,
  contractCategoryItemsList,
  contractStatutItemsList,
  genderItemsList,
  stClausesActivesList,
  stDelaiUnitItemsList,
  stFormeJuridiqueItemsList,
  stLotTypeItemsList,
  stProjetTypeItemsList,
  stTypePrixItemsList,
  typeContratItemsList,
} = rawData;

describe('items lists', () => {
  describe('genderItemsList', () => {
    it('has two entries with correct codes and values', () => {
      expect(genderItemsList).toHaveLength(2);

      expect(genderItemsList[0]).toEqual({code: 'H', value: 'Homme'});
      expect(genderItemsList[1]).toEqual({code: 'F', value: 'Femme'});

      const codes = genderItemsList.map((i) => i.code);
      expect(codes).toEqual(['H', 'F']);

      const values = genderItemsList.map((i) => i.value);
      expect(values).toEqual(['Homme', 'Femme']);
    });

    it('contains unique codes', () => {
      const codes = genderItemsList.map((i) => i.code);
      const unique = Array.from(new Set(codes));
      expect(unique).toHaveLength(codes.length);
    });
  });

  describe('contractStatutItemsList', () => {
    it('has 7 statuses', () => {
      expect(contractStatutItemsList).toHaveLength(7);
    });

    it('starts with Brouillon code', () => {
      expect(contractStatutItemsList[0].code).toBe('Brouillon');
    });

    it('contains unique codes', () => {
      const codes = contractStatutItemsList.map((i) => i.code);
      expect(new Set(codes).size).toBe(codes.length);
    });
  });

  describe('getContractStatusColor', () => {
    it('returns a color for every status in contractStatutItemsList', () => {
      for (const item of contractStatutItemsList) {
        expect(getContractStatusColor(item.code)).toBeDefined();
      }
    });

    it('returns a valid MUI chip color for each status', () => {
      const validColors = ['default', 'warning', 'success', 'error', 'info', 'primary', 'secondary'];
      for (const item of contractStatutItemsList) {
        expect(validColors).toContain(getContractStatusColor(item.code));
      }
    });

    it('returns default for unknown status', () => {
      expect(getContractStatusColor('unknown')).toBe('default');
    });
  });

  describe('typeContratItemsList', () => {
    it('has 7 contract types', () => {
      expect(typeContratItemsList).toHaveLength(7);
    });

    it('each entry has code and value', () => {
      for (const item of typeContratItemsList) {
        expect(item).toHaveProperty('code');
        expect(item).toHaveProperty('value');
        expect(typeof item.code).toBe('string');
        expect(typeof item.value).toBe('string');
      }
    });

    it('contains unique codes', () => {
      const codes = typeContratItemsList.map((i) => i.code);
      expect(new Set(codes).size).toBe(codes.length);
    });
  });

  describe('deviseItemsList', () => {
    it('has 3 currencies', () => {
      expect(deviseItemsList).toEqual(['MAD', 'EUR', 'USD']);
    });
  });

  describe('confidentialiteItemsList', () => {
    it('has 3 confidentiality levels', () => {
      expect(confidentialiteItemsList).toHaveLength(3);
      const codes = confidentialiteItemsList.map((i) => i.code);
      expect(codes).toEqual(['CONFIDENTIEL', 'USAGE INTERNE', 'STANDARD']);
    });
  });

  /* ── Contract Category ── */

  describe('contractCategoryItemsList', () => {
    it('has 2 entries (standard, sous_traitance)', () => {
      expect(contractCategoryItemsList).toHaveLength(2);
    });

    it('contains standard and sous_traitance codes', () => {
      const codes = contractCategoryItemsList.map((i) => i.code);
      expect(codes).toEqual(['standard', 'sous_traitance']);
    });

    it('each entry has code and value strings', () => {
      for (const item of contractCategoryItemsList) {
        expect(typeof item.code).toBe('string');
        expect(typeof item.value).toBe('string');
      }
    });

    it('contains unique codes', () => {
      const codes = contractCategoryItemsList.map((i) => i.code);
      expect(new Set(codes).size).toBe(codes.length);
    });
  });

  /* ── Sous-Traitance dropdown lists ── */

  describe('stLotTypeItemsList', () => {
    it('has 14 lot types', () => {
      expect(stLotTypeItemsList).toHaveLength(14);
    });

    it('each entry has code and value', () => {
      for (const item of stLotTypeItemsList) {
        expect(item).toHaveProperty('code');
        expect(item).toHaveProperty('value');
      }
    });

    it('contains unique codes', () => {
      const codes = stLotTypeItemsList.map((i) => i.code);
      expect(new Set(codes).size).toBe(codes.length);
    });

    it('includes expected lot codes', () => {
      const codes = stLotTypeItemsList.map((i) => i.code);
      expect(codes).toContain('gros_oeuvre');
      expect(codes).toContain('electricite');
      expect(codes).toContain('plomberie');
      expect(codes).toContain('cuisine');
    });
  });

  describe('stProjetTypeItemsList', () => {
    it('has 6 project types', () => {
      expect(stProjetTypeItemsList).toHaveLength(6);
    });

    it('contains unique codes', () => {
      const codes = stProjetTypeItemsList.map((i) => i.code);
      expect(new Set(codes).size).toBe(codes.length);
    });

    it('includes expected project types', () => {
      const codes = stProjetTypeItemsList.map((i) => i.code);
      expect(codes).toContain('immeuble');
      expect(codes).toContain('villa');
      expect(codes).toContain('autre');
    });
  });

  describe('stFormeJuridiqueItemsList', () => {
    it('has 6 legal form entries', () => {
      expect(stFormeJuridiqueItemsList).toHaveLength(6);
    });

    it('contains unique codes', () => {
      const codes = stFormeJuridiqueItemsList.map((i) => i.code);
      expect(new Set(codes).size).toBe(codes.length);
    });

    it('includes SARL and auto_entrepreneur', () => {
      const codes = stFormeJuridiqueItemsList.map((i) => i.code);
      expect(codes).toContain('SARL');
      expect(codes).toContain('auto_entrepreneur');
    });
  });

  describe('stTypePrixItemsList', () => {
    it('has 3 price types', () => {
      expect(stTypePrixItemsList).toHaveLength(3);
    });

    it('contains forfaitaire, unitaire, regie', () => {
      const codes = stTypePrixItemsList.map((i) => i.code);
      expect(codes).toEqual(['forfaitaire', 'unitaire', 'regie']);
    });
  });

  describe('stDelaiUnitItemsList', () => {
    it('has 3 delay unit entries', () => {
      expect(stDelaiUnitItemsList).toHaveLength(3);
    });

    it('contains mois, semaines, jours', () => {
      const codes = stDelaiUnitItemsList.map((i) => i.code);
      expect(codes).toEqual(['mois', 'semaines', 'jours']);
    });
  });

  describe('stClausesActivesList', () => {
    it('has 11 clause entries', () => {
      expect(stClausesActivesList).toHaveLength(11);
    });

    it('each entry has key and label', () => {
      for (const item of stClausesActivesList) {
        expect(item).toHaveProperty('key');
        expect(item).toHaveProperty('label');
        expect(typeof item.key).toBe('string');
        expect(typeof item.label).toBe('string');
      }
    });

    it('contains unique keys', () => {
      const keys = stClausesActivesList.map((i) => i.key);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it('includes expected clause keys', () => {
      const keys = stClausesActivesList.map((i) => i.key);
      expect(keys).toContain('tConfid');
      expect(keys).toContain('tNonConc');
      expect(keys).toContain('tTRC');
      expect(keys).toContain('tMediat');
    });
  });
});

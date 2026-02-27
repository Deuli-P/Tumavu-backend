import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Roles ────────────────────────────────────────────────────────────────────

const roles = [
  { label: 'ADMIN' },
  { label: 'USER' },
  { label: 'CONVOYEUR' },
];

// ─── Countries ────────────────────────────────────────────────────────────────

const countries = [
  // Europe
  { name: 'France',              nativeName: 'France',               code: 'FR', phoneIndicatif: '+33',   nationality: 'Française' },
  { name: 'Belgique',            nativeName: 'België / Belgique',    code: 'BE', phoneIndicatif: '+32',   nationality: 'Belge' },
  { name: 'Suisse',              nativeName: 'Schweiz / Suisse',     code: 'CH', phoneIndicatif: '+41',   nationality: 'Suisse' },
  { name: 'Luxembourg',          nativeName: 'Lëtzebuerg',           code: 'LU', phoneIndicatif: '+352',  nationality: 'Luxembourgeoise' },
  { name: 'Allemagne',           nativeName: 'Deutschland',          code: 'DE', phoneIndicatif: '+49',   nationality: 'Allemande' },
  { name: 'Espagne',             nativeName: 'España',               code: 'ES', phoneIndicatif: '+34',   nationality: 'Espagnole' },
  { name: 'Italie',              nativeName: 'Italia',               code: 'IT', phoneIndicatif: '+39',   nationality: 'Italienne' },
  { name: 'Portugal',            nativeName: 'Portugal',             code: 'PT', phoneIndicatif: '+351',  nationality: 'Portugaise' },
  { name: 'Pays-Bas',            nativeName: 'Nederland',            code: 'NL', phoneIndicatif: '+31',   nationality: 'Néerlandaise' },
  { name: 'Royaume-Uni',         nativeName: 'United Kingdom',       code: 'GB', phoneIndicatif: '+44',   nationality: 'Britannique' },
  { name: 'Irlande',             nativeName: 'Ireland',              code: 'IE', phoneIndicatif: '+353',  nationality: 'Irlandaise' },
  { name: 'Suède',               nativeName: 'Sverige',              code: 'SE', phoneIndicatif: '+46',   nationality: 'Suédoise' },
  { name: 'Norvège',             nativeName: 'Norge',                code: 'NO', phoneIndicatif: '+47',   nationality: 'Norvégienne' },
  { name: 'Danemark',            nativeName: 'Danmark',              code: 'DK', phoneIndicatif: '+45',   nationality: 'Danoise' },
  { name: 'Finlande',            nativeName: 'Suomi',                code: 'FI', phoneIndicatif: '+358',  nationality: 'Finlandaise' },
  { name: 'Autriche',            nativeName: 'Österreich',           code: 'AT', phoneIndicatif: '+43',   nationality: 'Autrichienne' },
  { name: 'Pologne',             nativeName: 'Polska',               code: 'PL', phoneIndicatif: '+48',   nationality: 'Polonaise' },
  { name: 'Roumanie',            nativeName: 'România',              code: 'RO', phoneIndicatif: '+40',   nationality: 'Roumaine' },
  { name: 'Grèce',               nativeName: 'Ελλάδα',               code: 'GR', phoneIndicatif: '+30',   nationality: 'Grecque' },
  { name: 'République tchèque',  nativeName: 'Česká republika',      code: 'CZ', phoneIndicatif: '+420',  nationality: 'Tchèque' },
  { name: 'Hongrie',             nativeName: 'Magyarország',         code: 'HU', phoneIndicatif: '+36',   nationality: 'Hongroise' },
  { name: 'Ukraine',             nativeName: 'Україна',              code: 'UA', phoneIndicatif: '+380',  nationality: 'Ukrainienne' },
  { name: 'Russie',              nativeName: 'Россия',               code: 'RU', phoneIndicatif: '+7',    nationality: 'Russe' },
  { name: 'Turquie',             nativeName: 'Türkiye',              code: 'TR', phoneIndicatif: '+90',   nationality: 'Turque' },
  // Afrique
  { name: 'Maroc',               nativeName: 'المغرب',               code: 'MA', phoneIndicatif: '+212',  nationality: 'Marocaine' },
  { name: 'Algérie',             nativeName: 'الجزائر',              code: 'DZ', phoneIndicatif: '+213',  nationality: 'Algérienne' },
  { name: 'Tunisie',             nativeName: 'تونس',                 code: 'TN', phoneIndicatif: '+216',  nationality: 'Tunisienne' },
  { name: 'Égypte',              nativeName: 'مصر',                  code: 'EG', phoneIndicatif: '+20',   nationality: 'Égyptienne' },
  { name: 'Sénégal',             nativeName: 'Sénégal',              code: 'SN', phoneIndicatif: '+221',  nationality: 'Sénégalaise' },
  { name: 'Côte d\'Ivoire',      nativeName: 'Côte d\'Ivoire',       code: 'CI', phoneIndicatif: '+225',  nationality: 'Ivoirienne' },
  { name: 'Cameroun',            nativeName: 'Cameroun',             code: 'CM', phoneIndicatif: '+237',  nationality: 'Camerounaise' },
  { name: 'Ghana',               nativeName: 'Ghana',                code: 'GH', phoneIndicatif: '+233',  nationality: 'Ghanéenne' },
  { name: 'Nigeria',             nativeName: 'Nigeria',              code: 'NG', phoneIndicatif: '+234',  nationality: 'Nigériane' },
  { name: 'Afrique du Sud',      nativeName: 'South Africa',         code: 'ZA', phoneIndicatif: '+27',   nationality: 'Sud-Africaine' },
  { name: 'Kenya',               nativeName: 'Kenya',                code: 'KE', phoneIndicatif: '+254',  nationality: 'Kényane' },
  { name: 'Éthiopie',            nativeName: 'ኢትዮጵያ',               code: 'ET', phoneIndicatif: '+251',  nationality: 'Éthiopienne' },
  { name: 'Madagascar',          nativeName: 'Madagasikara',         code: 'MG', phoneIndicatif: '+261',  nationality: 'Malgache' },
  { name: 'Mauritanie',          nativeName: 'موريتانيا',            code: 'MR', phoneIndicatif: '+222',  nationality: 'Mauritanienne' },
  { name: 'Mali',                nativeName: 'Mali',                 code: 'ML', phoneIndicatif: '+223',  nationality: 'Malienne' },
  { name: 'Burkina Faso',        nativeName: 'Burkina Faso',         code: 'BF', phoneIndicatif: '+226',  nationality: 'Burkinabè' },
  { name: 'République démocratique du Congo', nativeName: 'Congo', code: 'CD', phoneIndicatif: '+243', nationality: 'Congolaise' },
  { name: 'Congo',               nativeName: 'Congo',                code: 'CG', phoneIndicatif: '+242',  nationality: 'Congolaise' },
  { name: 'Gabon',               nativeName: 'Gabon',                code: 'GA', phoneIndicatif: '+241',  nationality: 'Gabonaise' },
  // Amériques
  { name: 'États-Unis',          nativeName: 'United States',        code: 'US', phoneIndicatif: '+1',    nationality: 'Américaine' },
  { name: 'Canada',              nativeName: 'Canada',               code: 'CA', phoneIndicatif: '+1',    nationality: 'Canadienne' },
  { name: 'Brésil',              nativeName: 'Brasil',               code: 'BR', phoneIndicatif: '+55',   nationality: 'Brésilienne' },
  { name: 'Argentine',           nativeName: 'Argentina',            code: 'AR', phoneIndicatif: '+54',   nationality: 'Argentine' },
  { name: 'Mexique',             nativeName: 'México',               code: 'MX', phoneIndicatif: '+52',   nationality: 'Mexicaine' },
  { name: 'Colombie',            nativeName: 'Colombia',             code: 'CO', phoneIndicatif: '+57',   nationality: 'Colombienne' },
  { name: 'Pérou',               nativeName: 'Perú',                 code: 'PE', phoneIndicatif: '+51',   nationality: 'Péruvienne' },
  { name: 'Chili',               nativeName: 'Chile',                code: 'CL', phoneIndicatif: '+56',   nationality: 'Chilienne' },
  { name: 'Venezuela',           nativeName: 'Venezuela',            code: 'VE', phoneIndicatif: '+58',   nationality: 'Vénézuélienne' },
  { name: 'Haïti',               nativeName: 'Haïti',                code: 'HT', phoneIndicatif: '+509',  nationality: 'Haïtienne' },
  // Asie & Moyen-Orient
  { name: 'Chine',               nativeName: '中国',                  code: 'CN', phoneIndicatif: '+86',   nationality: 'Chinoise' },
  { name: 'Japon',               nativeName: '日本',                  code: 'JP', phoneIndicatif: '+81',   nationality: 'Japonaise' },
  { name: 'Inde',                nativeName: 'भारत',                 code: 'IN', phoneIndicatif: '+91',   nationality: 'Indienne' },
  { name: 'Corée du Sud',        nativeName: '대한민국',               code: 'KR', phoneIndicatif: '+82',   nationality: 'Sud-Coréenne' },
  { name: 'Indonésie',           nativeName: 'Indonesia',            code: 'ID', phoneIndicatif: '+62',   nationality: 'Indonésienne' },
  { name: 'Vietnam',             nativeName: 'Việt Nam',             code: 'VN', phoneIndicatif: '+84',   nationality: 'Vietnamienne' },
  { name: 'Thaïlande',           nativeName: 'ประเทศไทย',             code: 'TH', phoneIndicatif: '+66',   nationality: 'Thaïlandaise' },
  { name: 'Pakistan',            nativeName: 'پاکستان',              code: 'PK', phoneIndicatif: '+92',   nationality: 'Pakistanaise' },
  { name: 'Bangladesh',          nativeName: 'বাংলাদেশ',             code: 'BD', phoneIndicatif: '+880',  nationality: 'Bangladaise' },
  { name: 'Arabie Saoudite',     nativeName: 'المملكة العربية السعودية', code: 'SA', phoneIndicatif: '+966', nationality: 'Saoudienne' },
  { name: 'Émirats arabes unis', nativeName: 'الإمارات',             code: 'AE', phoneIndicatif: '+971',  nationality: 'Émiratie' },
  { name: 'Liban',               nativeName: 'لبنان',                code: 'LB', phoneIndicatif: '+961',  nationality: 'Libanaise' },
  { name: 'Israël',              nativeName: 'ישראל',                code: 'IL', phoneIndicatif: '+972',  nationality: 'Israélienne' },
  { name: 'Iran',                nativeName: 'ایران',                code: 'IR', phoneIndicatif: '+98',   nationality: 'Iranienne' },
  // Océanie
  { name: 'Australie',           nativeName: 'Australia',            code: 'AU', phoneIndicatif: '+61',   nationality: 'Australienne' },
  { name: 'Nouvelle-Zélande',    nativeName: 'New Zealand',          code: 'NZ', phoneIndicatif: '+64',   nationality: 'Néo-Zélandaise' },
];

// ─── Languages ────────────────────────────────────────────────────────────────

const languages = [
  { name: 'Français',    code: 'fr' },
  { name: 'Anglais',     code: 'en' },
  { name: 'Espagnol',    code: 'es' },
  { name: 'Arabe',       code: 'ar' },
  { name: 'Portugais',   code: 'pt' },
  { name: 'Allemand',    code: 'de' },
  { name: 'Italien',     code: 'it' },
  { name: 'Néerlandais', code: 'nl' },
  { name: 'Russe',       code: 'ru' },
  { name: 'Chinois',     code: 'zh' },
  { name: 'Japonais',    code: 'ja' },
  { name: 'Coréen',      code: 'ko' },
  { name: 'Hindi',       code: 'hi' },
  { name: 'Bengali',     code: 'bn' },
  { name: 'Turc',        code: 'tr' },
  { name: 'Polonais',    code: 'pl' },
  { name: 'Ukrainien',   code: 'uk' },
  { name: 'Roumain',     code: 'ro' },
  { name: 'Grec',        code: 'el' },
  { name: 'Suédois',     code: 'sv' },
  { name: 'Norvégien',   code: 'no' },
  { name: 'Danois',      code: 'da' },
  { name: 'Finnois',     code: 'fi' },
  { name: 'Vietnamien',  code: 'vi' },
  { name: 'Thaï',        code: 'th' },
  { name: 'Indonésien',  code: 'id' },
  { name: 'Persan',      code: 'fa' },
  { name: 'Hébreu',      code: 'he' },
  { name: 'Wolof',       code: 'wo' },
  { name: 'Bambara',     code: 'bm' },
  { name: 'Haoussa',     code: 'ha' },
  { name: 'Swahili',     code: 'sw' },
  { name: 'Amharique',   code: 'am' },
  { name: 'Malgache',    code: 'mg' },
  { name: 'Créole haïtien', code: 'ht' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seed en cours...');

  // Roles
  for (const role of roles) {
    await prisma.role.upsert({
      where: { label: role.label },
      update: {},
      create: role,
    });
  }
  console.log(`  ✓ ${roles.length} roles inseres`);

  // Countries
  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: {},
      create: country,
    });
  }
  console.log(`  ✓ ${countries.length} pays inseres`);

  // Languages
  for (const language of languages) {
    await prisma.language.upsert({
      where: { code: language.code },
      update: {},
      create: language,
    });
  }
  console.log(`  ✓ ${languages.length} langues inserees`);

  console.log('Seed termine avec succes.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

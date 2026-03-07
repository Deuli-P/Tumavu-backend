import { PrismaClient, RoleType, AnnouncementStatus, JobOfferStatus, ContractOfferType, ExperienceLevel, Season } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// ─── Job Categories ────────────────────────────────────────────────────────────

const jobCategories = [
  { name: 'Viticulture',             slug: 'viticulture' },
  { name: 'Maraîchage',              slug: 'maraichage' },
  { name: 'Arboriculture',           slug: 'arboriculture' },
  { name: 'Élevage',                 slug: 'elevage' },
  { name: 'Restauration',            slug: 'restauration' },
  { name: 'Hôtellerie',              slug: 'hotellerie' },
  { name: 'Ski / Sports d\'hiver',   slug: 'ski-sports-hiver' },
  { name: 'Vendanges',               slug: 'vendanges' },
  { name: 'Cueillette',              slug: 'cueillette' },
  { name: 'Logistique',              slug: 'logistique' },
  { name: 'Animation',               slug: 'animation' },
  { name: 'Entretien espaces verts', slug: 'entretien-espaces-verts' },
];

const prisma = new PrismaClient();

// ─── Roles ────────────────────────────────────────────────────────────────────

const roles: Array<{ value: string; type: RoleType }> = [
  { value: 'Administrator', type: RoleType.ADMIN},
  { value: 'User', type: RoleType.USER },
  { value: 'Owner', type: RoleType.MANAGER },
  { value: 'CEO', type: RoleType.ADMIN },
  { value: 'Developper', type: RoleType.ADMIN},
];


// ─── Countries ────────────────────────────────────────────────────────────────

const countries = [
  // Europe
  { name: 'FRANCE',              nativeName: 'France',               code: 'FR', phoneIndicatif: '+33',   nationality: 'FRENCH' },
  { name: 'BELGIUM',            nativeName: 'België / Belgique',    code: 'BE', phoneIndicatif: '+32',   nationality: 'BELGIAN' },
  { name: 'SWITZERLAND',              nativeName: 'Schweiz / Suisse',     code: 'CH', phoneIndicatif: '+41',   nationality: 'SWISS' },
  { name: 'LUXEMBOURG',          nativeName: 'Lëtzebuerg',           code: 'LU', phoneIndicatif: '+352',  nationality: 'LUXEMBOURGISH' },
  { name: 'GERMANY',           nativeName: 'Deutschland',          code: 'DE', phoneIndicatif: '+49',   nationality: 'GERMAN' },
  { name: 'SPAIN',             nativeName: 'España',               code: 'ES', phoneIndicatif: '+34',   nationality: 'SPANISH' },
  { name: 'ITALY',              nativeName: 'Italia',               code: 'IT', phoneIndicatif: '+39',   nationality: 'ITALIAN' },
  { name: 'PORTUGAL',            nativeName: 'Portugal',             code: 'PT', phoneIndicatif: '+351',  nationality: 'PORTUGUESE' },
  { name: 'NETHERLANDS',            nativeName: 'Nederland',            code: 'NL', phoneIndicatif: '+31',   nationality: 'DUTCH' },
  { name: 'UNITED_KINGDOM',         nativeName: 'United Kingdom',       code: 'GB', phoneIndicatif: '+44',   nationality: 'BRITISH' },
  { name: 'IRELAND',             nativeName: 'Ireland',              code: 'IE', phoneIndicatif: '+353',  nationality: 'IRISH' },
  { name: 'SWEDEN',               nativeName: 'Sverige',              code: 'SE', phoneIndicatif: '+46',   nationality: 'SWEDISH' },
  { name: 'NORWAY',             nativeName: 'Norge',                code: 'NO', phoneIndicatif: '+47',   nationality: 'NORWEGIAN' },
  { name: 'DENMARK',            nativeName: 'Danmark',              code: 'DK', phoneIndicatif: '+45',   nationality: 'DANISH' },
  { name: 'FINLAND',            nativeName: 'Suomi',                code: 'FI', phoneIndicatif: '+358',  nationality: 'FINNISH' },
  { name: 'AUSTRIA',            nativeName: 'Österreich',           code: 'AT', phoneIndicatif: '+43',   nationality: 'AUSTRIAN' },
  { name: 'POLAND',             nativeName: 'Polska',               code: 'PL', phoneIndicatif: '+48',   nationality: 'POLISH' },
  { name: 'ROMANIA',            nativeName: 'România',              code: 'RO', phoneIndicatif: '+40',   nationality: 'ROMANIAN' },
  { name: 'GREECE',               nativeName: 'Ελλάδα',               code: 'GR', phoneIndicatif: '+30',   nationality: 'GREEK' },
  { name: 'CZECH_REPUBLIC',  nativeName: 'Česká republika',      code: 'CZ', phoneIndicatif: '+420',  nationality: 'CZECH' },
  { name: 'HUNGARY',             nativeName: 'Magyarország',         code: 'HU', phoneIndicatif: '+36',   nationality: 'HUNGARIAN' },
  { name: 'UKRAINE',             nativeName: 'Україна',              code: 'UA', phoneIndicatif: '+380',  nationality: 'UKRAINIAN' },
  { name: 'RUSSIA',              nativeName: 'Россия',               code: 'RU', phoneIndicatif: '+7',    nationality: 'RUSSIAN' },
  { name: 'TURKEY',             nativeName: 'Türkiye',              code: 'TR', phoneIndicatif: '+90',   nationality: 'TURKISH' },
  // Afrique
  { name: 'MOROCCO',               nativeName: 'المغرب',               code: 'MA', phoneIndicatif: '+212',  nationality: 'MOROCCAN' },
  { name: 'ALGERIA',             nativeName: 'الجزائر',              code: 'DZ', phoneIndicatif: '+213',  nationality: 'ALGERIAN' },
  { name: 'TUNISIA',             nativeName: 'تونس',                 code: 'TN', phoneIndicatif: '+216',  nationality: 'TUNISIAN' },
  { name: 'EGYPT',              nativeName: 'مصر',                  code: 'EG', phoneIndicatif: '+20',   nationality: 'EGYPTIAN' },
  { name: 'SENEGAL',             nativeName: 'Sénégal',              code: 'SN', phoneIndicatif: '+221',  nationality: 'SENEGALese' },
  { name: 'CÔTE_D_IVOIRE',      nativeName: 'Côte d\'Ivoire',       code: 'CI', phoneIndicatif: '+225',  nationality: 'IVOIRIAN' },
  { name: 'CAMEROON',            nativeName: 'Cameroun',             code: 'CM', phoneIndicatif: '+237',  nationality: 'CAMEROONIAN' },
  { name: 'GHANA',               nativeName: 'Ghana',                code: 'GH', phoneIndicatif: '+233',  nationality: 'GHANAIAN' },
  { name: 'NIGERIA',             nativeName: 'Nigeria',              code: 'NG', phoneIndicatif: '+234',  nationality: 'NIGERIAN' },
  { name: 'SOUTH_AFRICA',      nativeName: 'South Africa',         code: 'ZA', phoneIndicatif: '+27',   nationality: 'SOUTH_AFRICAN' },
  { name: 'KENYA',               nativeName: 'Kenya',                code: 'KE', phoneIndicatif: '+254',  nationality: 'KENYAN' },
  { name: 'ETHIOPIA',            nativeName: 'ኢትዮጵያ',               code: 'ET', phoneIndicatif: '+251',  nationality: 'ETHIOPIAN' },
  { name: 'MADAGASCAR',          nativeName: 'Madagasikara',         code: 'MG', phoneIndicatif: '+261',  nationality: 'MALAGASY' },
  { name: 'MAURITANIA',          nativeName: 'موريتانيا',            code: 'MR', phoneIndicatif: '+222',  nationality: 'MAURITANIAN' },
  { name: 'MALI',                nativeName: 'Mali',                 code: 'ML', phoneIndicatif: '+223',  nationality: 'MALIAN' },
  { name: 'BURKINA_FASO',        nativeName: 'Burkina Faso',         code: 'BF', phoneIndicatif: '+226',  nationality: 'BURKINABE' },
  { name: 'RÉPUBLIQUE_DÉMOCRATIQUE_DU_CONGO', nativeName: 'Congo', code: 'CD', phoneIndicatif: '+243', nationality: 'CONGOLESE_DRC' },
  { name: 'CONGO',               nativeName: 'Congo',                code: 'CG', phoneIndicatif: '+242',  nationality: 'CONGOLESE_RC' },
  { name: 'GABON',               nativeName: 'Gabon',                code: 'GA', phoneIndicatif: '+241',  nationality: 'GABONESE' },
  // Amériques
  { name: 'UNITED_STATES',          nativeName: 'United States',        code: 'US', phoneIndicatif: '+1',    nationality: 'AMERICAN' },
  { name: 'CANADA',              nativeName: 'Canada',               code: 'CA', phoneIndicatif: '+1',    nationality: 'CANADIAN' },
  { name: 'BRAZIL',              nativeName: 'Brasil',               code: 'BR', phoneIndicatif: '+55',   nationality: 'BRAZILIAN' },
  { name: 'ARGENTINA',           nativeName: 'Argentina',            code: 'AR', phoneIndicatif: '+54',   nationality: 'ARGENTINIAN' },
  { name: 'MEXICO',             nativeName: 'México',               code: 'MX', phoneIndicatif: '+52',   nationality: 'MEXICAN' },
  { name: 'COLOMBIA',            nativeName: 'Colombia',             code: 'CO', phoneIndicatif: '+57',   nationality: 'COLOMBIAN' },
  { name: 'PERU',               nativeName: 'Perú',                 code: 'PE', phoneIndicatif: '+51',   nationality: 'PERUVIAN' },
  { name: 'CHILE',               nativeName: 'Chile',                code: 'CL', phoneIndicatif: '+56',   nationality: 'CHILEAN' },
  { name: 'VENEZUELA',           nativeName: 'Venezuela',            code: 'VE', phoneIndicatif: '+58',   nationality: 'VENEZUELAN' },
  { name: 'HAITI',               nativeName: 'Haïti',                code: 'HT', phoneIndicatif: '+509',  nationality: 'HAITIAN' },
  // Asie & Moyen-Orient
  { name: 'CHINA',               nativeName: '中国',                  code: 'CN', phoneIndicatif: '+86',   nationality: 'CHINESE' },
  { name: 'JAPAN',               nativeName: '日本',                  code: 'JP', phoneIndicatif: '+81',   nationality: 'JAPANESE' },
  { name: 'INDIA',                nativeName: 'भारत',                 code: 'IN', phoneIndicatif: '+91',   nationality: 'INDIAN' },
  { name: 'SOUTH_KOREA',        nativeName: '대한민국',               code: 'KR', phoneIndicatif: '+82',   nationality: 'SOUTH_KOREAN' },
  { name: 'INDONESIA',           nativeName: 'Indonesia',            code: 'ID', phoneIndicatif: '+62',   nationality: 'INDONESIAN' },
  { name: 'VIETNAM',             nativeName: 'Việt Nam',             code: 'VN', phoneIndicatif: '+84',   nationality: 'VIETNAMESE' },
  { name: 'THAILAND',           nativeName: 'ประเทศไทย',             code: 'TH', phoneIndicatif: '+66',   nationality: 'THAI' },
  { name: 'PAKISTAN',            nativeName: 'پاکستان',              code: 'PK', phoneIndicatif: '+92',   nationality: 'PAKISTANI' },
  { name: 'BANGLADESH',          nativeName: 'বাংলাদেশ',             code: 'BD', phoneIndicatif: '+880',  nationality: 'BANGLADESHI' },
  { name: 'SAUDI_ARABIA',     nativeName: 'المملكة العربية السعودية', code: 'SA', phoneIndicatif: '+966', nationality: 'SAUDI' },
  { name: 'UNITED_ARAB_EMIRATES', nativeName: 'الإمارات',             code: 'AE', phoneIndicatif: '+971',  nationality: 'EMIRATI' },
  { name: 'LEBANON',               nativeName: 'لبنان',                code: 'LB', phoneIndicatif: '+961',  nationality: 'LEBANESE' },
  { name: 'ISRAEL',              nativeName: 'ישראל',                code: 'IL', phoneIndicatif: '+972',  nationality: 'ISRAELI' },
  { name: 'IRAN',                nativeName: 'ایران',                code: 'IR', phoneIndicatif: '+98',   nationality: 'IRANIAN' },
  // Oceania
  { name: 'AUSTRALIA',           nativeName: 'Australia',            code: 'AU', phoneIndicatif: '+61',   nationality: 'AUSTRALIAN' },
  { name: 'NEW_ZEALAND',    nativeName: 'New Zealand',          code: 'NZ', phoneIndicatif: '+64',   nationality: 'NEW_ZEALANDER' },
];

// ─── Languages ────────────────────────────────────────────────────────────────

const languages = [
  { name: 'FRENCH', code: 'fr' },
  { name: 'ENGLISH', code: 'en' },
  { name: 'SPANISH', code: 'es' }
];



// ─── Permissions ─────────────────────────────────────────────────────────────────────

const permissions = [
  { value: 'read_users' },
  { value: 'write_users' },
  { value: 'delete_users' },
  { value: 'read_companies' },
  { value: 'write_companies' },
  { value: 'delete_companies' },
  { value: 'read_roles' },
  { value: 'write_roles' },
  { value: 'delete_roles' },
  { value: 'create_jobs' },
  { value: 'update_jobs' },
  { value: 'delete_jobs' },
  { value: 'apply_jobs' },
  { value: 'upload_cv' },
  { value: 'upload_cover_letter' },
  { value: 'upload_photo' },

];
// ─── Permissions-role ─────────────────────────────────────────────────────────────
// Defined by role value (not id) to avoid hardcoded auto-increment assumptions.

const permission_roles_by_value: Array<{ roleValue: string; permissionId: number }> = [
  // Administrator — full access
  { roleValue: 'Administrator', permissionId: 1 },
  { roleValue: 'Administrator', permissionId: 2 },
  { roleValue: 'Administrator', permissionId: 3 },
  { roleValue: 'Administrator', permissionId: 4 },
  { roleValue: 'Administrator', permissionId: 5 },
  { roleValue: 'Administrator', permissionId: 6 },
  { roleValue: 'Administrator', permissionId: 7 },
  { roleValue: 'Administrator', permissionId: 8 },
  { roleValue: 'Administrator', permissionId: 9 },
  { roleValue: 'Administrator', permissionId: 10 },
  { roleValue: 'Administrator', permissionId: 11 },
  { roleValue: 'Administrator', permissionId: 12 },
  // User — basic permissions
  { roleValue: 'User', permissionId: 13 },
  { roleValue: 'User', permissionId: 14 },
  { roleValue: 'User', permissionId: 15 },
  // CEO — full access
  { roleValue: 'CEO', permissionId: 1 },
  { roleValue: 'CEO', permissionId: 2 },
  { roleValue: 'CEO', permissionId: 3 },
  { roleValue: 'CEO', permissionId: 4 },
  { roleValue: 'CEO', permissionId: 5 },
  { roleValue: 'CEO', permissionId: 6 },
  { roleValue: 'CEO', permissionId: 7 },
  { roleValue: 'CEO', permissionId: 8 },
  { roleValue: 'CEO', permissionId: 9 },
  { roleValue: 'CEO', permissionId: 10 },
  { roleValue: 'CEO', permissionId: 11 },
  { roleValue: 'CEO', permissionId: 12 },
  // Developper — full access
  { roleValue: 'Developper', permissionId: 1 },
  { roleValue: 'Developper', permissionId: 2 },
  { roleValue: 'Developper', permissionId: 3 },
  { roleValue: 'Developper', permissionId: 4 },
  { roleValue: 'Developper', permissionId: 5 },
  { roleValue: 'Developper', permissionId: 6 },
  { roleValue: 'Developper', permissionId: 7 },
  { roleValue: 'Developper', permissionId: 8 },
  { roleValue: 'Developper', permissionId: 9 },
  { roleValue: 'Developper', permissionId: 10 },
  { roleValue: 'Developper', permissionId: 11 },
  { roleValue: 'Developper', permissionId: 12 },
]


// ─── Tags ─────────────────────────────────────────────────────────────────────

const tags = [
  { name: 'URGENT' },
  { name: 'HIGH_PRIORITY' },
  { name: 'REMOTE' },
  { name: 'ON_SITE' },
  { name: 'FULL_TIME' },
  { name: 'PART_TIME' },
  { name: 'MOUNTAIN' },
  { name: 'CITY' },
  { name: 'COAST' },
  { name: 'LAKE' },
  { name: 'HOUSING' },
  { name: 'HOTEL' },
  { name: 'RESTAURANT' },
  { name: 'LONG_TERM' },
  { name: 'SHORT_TERM' },
  { name: 'COOKING' },
  { name: 'WAITER' },
  { name: 'SERVICE' },
  { name: 'PHOTOGRAPHY' },
  { name: 'MUSIC' },
  { name: 'ENTERTAINMENT' },
  { name: 'DANCE' },
  { name: 'BABYSITTING' },
  { name: 'COURSE' },
  { name: 'MENAGE' }
]
// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seed en cours...');

  // Roles
  for (const role of roles) {
    await prisma.role.upsert({
      where: { value: role.value },
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

  // Permissions
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { value: permission.value },
      update: {},
      create: permission,
    });
  }
  console.log(`  ✓ ${permissions.length} permissions inserees`);

  // Permission - Roles
  const roleMap = new Map<string, number>();
  const allRoles = await prisma.role.findMany({ select: { id: true, value: true } });
  for (const r of allRoles) roleMap.set(r.value, r.id);

  let prCount = 0;
  for (const pr of permission_roles_by_value) {
    const roleId = roleMap.get(pr.roleValue);
    if (!roleId) {
      console.warn(`  ⚠ Role "${pr.roleValue}" introuvable, ligne ignorée`);
      continue;
    }
    await prisma.permissionRole.upsert({
      where: { roleId_permissionId: { roleId, permissionId: pr.permissionId } },
      update: {},
      create: { roleId, permissionId: pr.permissionId },
    });
    prCount++;
  }
  console.log(`  ✓ ${prCount} permissions-roles inserees`);

  
  // Tags

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
  }
  console.log(`  ✓ ${tags.length} tags inserees`);
  
  // Job Categories
  for (const cat of jobCategories) {
    await prisma.jobCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`  ✓ ${jobCategories.length} categories de postes inserees`);

  // ── Fake data ──────────────────────────────────────────────────────────────

  // Skip if already seeded (idempotent)
  const alreadySeeded = await prisma.auth.findFirst({ where: { email: 'jean.dupont@tumavu-seed.fr' } });
  if (alreadySeeded) {
    console.log('  ℹ Fake data déjà présente, skip.');
    console.log('Seed termine avec succes.');
    return;
  }

  const PASSWORD_HASH = await bcrypt.hash('Password123!', 12);

  // Fixed UUIDs for idempotency
  const M1 = '00000000-seed-0001-0000-000000000001'; // manager 1
  const M2 = '00000000-seed-0002-0000-000000000002'; // manager 2
  const U1 = '00000000-seed-0003-0000-000000000003'; // user 1
  const U2 = '00000000-seed-0004-0000-000000000004'; // user 2
  const U3 = '00000000-seed-0005-0000-000000000005'; // user 3
  const C1 = '00000000-seed-0010-0000-000000000010'; // company 1
  const C2 = '00000000-seed-0011-0000-000000000011'; // company 2

  // Fetch roles & countries
  const managerRole = await prisma.role.findFirstOrThrow({ where: { type: RoleType.MANAGER } });
  const userRole    = await prisma.role.findFirstOrThrow({ where: { type: RoleType.USER } });
  const france      = await prisma.country.findFirstOrThrow({ where: { code: 'FR' } });
  const spain       = await prisma.country.findFirstOrThrow({ where: { code: 'ES' } });
  const italy       = await prisma.country.findFirstOrThrow({ where: { code: 'IT' } });
  const switzerland = await prisma.country.findFirstOrThrow({ where: { code: 'CH' } });

  // Job categories
  const catVendanges    = await prisma.jobCategory.findFirstOrThrow({ where: { slug: 'vendanges' } });
  const catViticulture  = await prisma.jobCategory.findFirstOrThrow({ where: { slug: 'viticulture' } });
  const catCueillette   = await prisma.jobCategory.findFirstOrThrow({ where: { slug: 'cueillette' } });
  const catMaraichage   = await prisma.jobCategory.findFirstOrThrow({ where: { slug: 'maraichage' } });
  const catRestauration = await prisma.jobCategory.findFirstOrThrow({ where: { slug: 'restauration' } });

  // ── Stations ──────────────────────────────────────────────────────────────

  const addrBordeaux = await prisma.address.create({
    data: { street: 'Rue du Palais', streetNumber: '12', zipCode: '33000', locality: 'Bordeaux', countryId: france.id },
  });
  const stationBordeaux = await prisma.station.create({
    data: { name: 'Station Bordeaux', countryId: france.id, officeAddressId: addrBordeaux.id },
  });

  const addrBarcelona = await prisma.address.create({
    data: { street: 'Carrer de Mallorca', streetNumber: '5', zipCode: '08001', locality: 'Barcelone', countryId: spain.id },
  });
  const stationBarcelona = await prisma.station.create({
    data: { name: 'Station Barcelone', countryId: spain.id, officeAddressId: addrBarcelona.id },
  });

  const addrToscane = await prisma.address.create({
    data: { street: 'Via dei Servi', streetNumber: '3', zipCode: '50100', locality: 'Florence', countryId: italy.id },
  });
  await prisma.station.create({
    data: { name: 'Station Toscane', countryId: italy.id, officeAddressId: addrToscane.id },
  });

  const addrVerbier = await prisma.address.create({
    data: { street: 'Route de Verbier', streetNumber: '1', zipCode: '1936', locality: 'Verbier', countryId: switzerland.id },
  });
  await prisma.station.create({
    data: { name: 'Station Verbier', countryId: switzerland.id, officeAddressId: addrVerbier.id },
  });

  console.log('  ✓ 4 stations inserees (FR, ES, IT, CH)');

  // ── Managers ──────────────────────────────────────────────────────────────

  await prisma.user.create({ data: { id: M1, firstName: 'Jean', lastName: 'Dupont', roleId: managerRole.id } });
  await prisma.auth.create({ data: { id: M1, email: 'jean.dupont@tumavu-seed.fr', password: PASSWORD_HASH } });

  await prisma.user.create({ data: { id: M2, firstName: 'Sofia', lastName: 'Fernandez', roleId: managerRole.id } });
  await prisma.auth.create({ data: { id: M2, email: 'sofia.fernandez@tumavu-seed.es', password: PASSWORD_HASH } });

  console.log('  ✓ 2 managers inseres');

  // ── Companies ─────────────────────────────────────────────────────────────

  const addrC1 = await prisma.address.create({
    data: { street: 'Route des Châteaux', streetNumber: '18', zipCode: '33330', locality: 'Saint-Émilion', countryId: france.id },
  });
  const company1 = await prisma.company.create({
    data: {
      id: C1,
      name: 'Domaine Viticole Dupont',
      description: 'Domaine viticole familial en Gironde spécialisé dans les vendanges saisonnières.',
      type: 'Viticulture',
      phone: '+33556789012',
      ownerId: M1,
      addressId: addrC1.id,
      stationId: stationBordeaux.id,
    },
  });

  const addrC2 = await prisma.address.create({
    data: { street: 'Carrer Major', streetNumber: '22', zipCode: '25001', locality: 'Lleida', countryId: spain.id },
  });
  const company2 = await prisma.company.create({
    data: {
      id: C2,
      name: 'Agri Sud Europe',
      description: 'Exploitation maraîchère et fruitière opérant en Espagne et en France.',
      type: 'Maraîchage',
      phone: '+34931234567',
      ownerId: M2,
      addressId: addrC2.id,
      stationId: stationBarcelona.id,
    },
  });

  console.log('  ✓ 2 companies inserees');

  // ── Regular users ─────────────────────────────────────────────────────────

  await prisma.user.create({ data: { id: U1, firstName: 'Alice', lastName: 'Martin', roleId: userRole.id, city: 'Lyon', postalCode: '69001', countryId: france.id } });
  await prisma.auth.create({ data: { id: U1, email: 'alice.martin@tumavu-seed.fr', password: PASSWORD_HASH } });

  await prisma.user.create({ data: { id: U2, firstName: 'Luca', lastName: 'Rossi', roleId: userRole.id, city: 'Milan', postalCode: '20121', countryId: italy.id } });
  await prisma.auth.create({ data: { id: U2, email: 'luca.rossi@tumavu-seed.it', password: PASSWORD_HASH } });

  await prisma.user.create({ data: { id: U3, firstName: 'Emma', lastName: 'Rousseau', roleId: userRole.id, city: 'Paris', postalCode: '75001', countryId: france.id } });
  await prisma.auth.create({ data: { id: U3, email: 'emma.rousseau@tumavu-seed.fr', password: PASSWORD_HASH } });

  console.log('  ✓ 3 utilisateurs inseres');

  // ── Jobs ──────────────────────────────────────────────────────────────────

  const job1 = await prisma.job.create({
    data: {
      title: 'Vendangeur',
      slug: 'vendangeur-dupont',
      description: 'Récolte manuelle du raisin en période de vendanges.',
      responsibilities: 'Cueillette du raisin, tri de la récolte, entretien du matériel.',
      requirements: 'Bonne condition physique, travail en extérieur, aucune expérience requise.',
      experienceLevel: ExperienceLevel.BEGINNER,
      season: Season.AUTUMN,
      transportRequired: false,
      companyId: company1.id,
      createdBy: M1,
      categoryId: catVendanges.id,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Tailleur de vigne',
      slug: 'tailleur-vigne-dupont',
      description: 'Taille hivernale des vignes pour préparer la saison.',
      responsibilities: 'Taille des sarments, entretien des rangs, liaison des bois.',
      requirements: 'Expérience en viticulture appréciée, bonne résistance au froid.',
      experienceLevel: ExperienceLevel.INTERMEDIATE,
      season: Season.WINTER,
      transportRequired: true,
      companyId: company1.id,
      createdBy: M1,
      categoryId: catViticulture.id,
    },
  });

  const job3 = await prisma.job.create({
    data: {
      title: 'Cueilleur de fruits',
      slug: 'cueilleur-fruits-agri',
      description: 'Cueillette de pommes, poires et pêches selon la saison.',
      responsibilities: 'Récolte manuelle, tri et conditionnement, chargement.',
      requirements: 'Aucune expérience requise, disponibilité sur plusieurs semaines.',
      experienceLevel: ExperienceLevel.BEGINNER,
      season: Season.SUMMER,
      transportRequired: false,
      companyId: company2.id,
      createdBy: M2,
      categoryId: catCueillette.id,
    },
  });

  const job4 = await prisma.job.create({
    data: {
      title: 'Maraîcher saisonnier',
      slug: 'maraicher-saisonnier-agri',
      description: 'Production de légumes en serre et en plein champ.',
      responsibilities: 'Plantation, arrosage, récolte, préparation des commandes.',
      requirements: 'Expérience en maraîchage souhaitée, travail physique.',
      experienceLevel: ExperienceLevel.INTERMEDIATE,
      season: Season.SPRING,
      transportRequired: false,
      companyId: company2.id,
      createdBy: M2,
      categoryId: catMaraichage.id,
    },
  });

  const job5 = await prisma.job.create({
    data: {
      title: 'Serveur en saison',
      slug: 'serveur-saison-dupont',
      description: 'Service en salle pour le restaurant du domaine viticole.',
      responsibilities: 'Accueil des clients, prise de commandes, service à table.',
      requirements: 'Expérience en restauration appréciée, bonne présentation.',
      experienceLevel: ExperienceLevel.INTERMEDIATE,
      season: Season.SUMMER,
      transportRequired: false,
      companyId: company1.id,
      createdBy: M1,
      categoryId: catRestauration.id,
    },
  });

  console.log('  ✓ 5 jobs inseres');

  // ── Job Offers ────────────────────────────────────────────────────────────

  await prisma.jobOffer.createMany({
    data: [
      {
        jobId: job1.id, companyId: company1.id, createdBy: M1,
        title: 'Vendangeur — Automne 2026',
        description: 'Rejoignez notre équipe pour les vendanges 2026 au cœur du Saint-Émilion.',
        startDate: new Date('2026-09-15'), endDate: new Date('2026-10-15'),
        duration: 30, hoursPerWeek: 40, contractType: ContractOfferType.CDD,
        salaryType: 'HOURLY', salaryMin: 11.88, salaryMax: 13,
        mealsProvided: true, status: JobOfferStatus.PUBLISHED,
      },
      {
        jobId: job2.id, companyId: company1.id, createdBy: M1,
        title: 'Tailleur de vigne — Hiver 2026',
        description: 'Mission de taille hivernale sur notre domaine de 40 hectares.',
        startDate: new Date('2026-01-10'), endDate: new Date('2026-03-10'),
        duration: 60, hoursPerWeek: 35, contractType: ContractOfferType.CDD,
        salaryType: 'HOURLY', salaryMin: 12.5,
        transportHelp: true, status: JobOfferStatus.PUBLISHED,
      },
      {
        jobId: job3.id, companyId: company2.id, createdBy: M2,
        title: 'Cueilleur de pommes — Été 2026',
        description: 'Cueillette estivale dans nos vergers en Catalogne.',
        startDate: new Date('2026-07-01'), endDate: new Date('2026-08-31'),
        duration: 61, hoursPerWeek: 40, contractType: ContractOfferType.EXTRA,
        salaryType: 'DAILY', salaryMin: 80, salaryMax: 95,
        housingProvided: 'PROVIDED', mealsProvided: true, status: JobOfferStatus.PUBLISHED,
      },
      {
        jobId: job4.id, companyId: company2.id, createdBy: M2,
        title: 'Maraîcher printemps 2026',
        description: 'Poste polyvalent dans notre exploitation maraîchère.',
        startDate: new Date('2026-03-01'), endDate: new Date('2026-06-30'),
        duration: 120, hoursPerWeek: 39, contractType: ContractOfferType.CDD,
        salaryType: 'MONTHLY', salaryMin: 1800, salaryMax: 2100,
        status: JobOfferStatus.DRAFT,
      },
      {
        jobId: job5.id, companyId: company1.id, createdBy: M1,
        title: 'Serveur restaurant domaine — Saison été 2026',
        description: 'Service en salle pour notre table d\'hôte ouverte aux visiteurs du domaine.',
        startDate: new Date('2026-06-01'), endDate: new Date('2026-09-30'),
        duration: 120, hoursPerWeek: 35, contractType: ContractOfferType.CDD,
        salaryType: 'MONTHLY', salaryMin: 1750,
        mealsProvided: true, tips: true, status: JobOfferStatus.PUBLISHED,
      },
    ],
  });

  console.log('  ✓ 5 offres d\'emploi inserees');

  // ── Announcements ─────────────────────────────────────────────────────────

  await prisma.announcement.create({
    data: {
      title: 'Bienvenue sur Tumavu !',
      description: 'Tumavu est la plateforme de référence pour le travail saisonnier agricole et touristique. Trouvez votre prochaine mission parmi des centaines d\'offres en France et en Europe.',
      status: AnnouncementStatus.PUBLISHED,
      publishedAt: new Date('2026-01-01'),
      createdBy: M1,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Maintenance prévue le 15 mars 2026',
      description: 'La plateforme sera indisponible le 15 mars 2026 de 2h à 4h du matin pour une mise à jour de nos serveurs.',
      status: AnnouncementStatus.DRAFT,
      createdBy: M1,
    },
  });

  console.log('  ✓ 2 annonces inserees');

  console.log('Seed termine avec succes.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

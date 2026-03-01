import { PrismaClient, RoleType } from '@prisma/client';

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
  
  console.log('Seed termine avec succes.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

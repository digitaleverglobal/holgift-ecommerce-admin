const normalize = (value) => String(value || '').trim().toLowerCase();
const PERMISSION_ALIASES = {
  order: 'orders',
  all_orders: 'orders',
  sale: 'orders',
  product: 'products',
  marketing: 'marketing_tools',
  settings: 'website_setting',
};
const normalizePermission = (value) => PERMISSION_ALIASES[normalize(value)] || normalize(value);
const PRIVILEGED_ROLES = new Set(['admin', 'superadmin', 'super_admin', 'super admin']);

export const PAGE_PERMISSION_MAP = {
  dashboard: ['dashboard'],
  orders: ['orders'],
  create_order: ['orders'],
  edit_order: ['orders'],
  invoice: ['orders'],
  products: ['products'],
  create_product: ['products.product_manage'],
  edit_product: ['products.product_manage'],
  create_category: ['products.categories'],
  edit_category: ['products.categories'],
  create_subcategory: ['products.subcategories'],
  edit_subcategory: ['products.subcategories'],
  create_childcategory: ['products.childcategories'],
  edit_childcategory: ['products.childcategories'],
  create_brand: ['products.brands'],
  edit_brand: ['products.brands'],
  create_attribute: ['products.attribute'],
  edit_attribute: ['products.attribute'],
  create_review: ['products.reviews'],
  edit_review: ['products.reviews'],
  supplier: ['supplier'],
  purchase: ['purchase'],
  landing: ['landing_page', 'landing_page_header', 'landing_page_footer'],
  admin: ['admin_user', 'admin_roles', 'admin_permissions'],
  customers: ['customers', 'ip_block'],
  // Repeat cards are listed on the Scratch Card page; the old repeat permission still opens it.
  scratch_card: ['scratch_card', 'scratch_card_repeat'],
  scratch_card_prize: ['scratch_card_prize'],
  website: ['website_setting'],
  api: ['api_integration'],
  marketing: ['marketing_tools'],
  blogs: ['blogs'],
  banner: ['banner_ads'],
  expense: ['expense'],
  reports: ['reports'],
};

export const SUBPAGE_PERMISSION_MAP = {
  activeLandingPage: {
    landing_create: ['landing_page'],
    landing_regular: ['landing_page'],
    landing_manage: ['landing_page'],
    landing_edit: ['landing_page'],
    landing_view: ['landing_page'],
    landing_header: ['landing_page_header'],
    landing_footer: ['landing_page_footer'],
  },
  activeAdminPage: {
    admin_user: ['admin_user'],
    admin_user_edit: ['admin_user'],
    admin_roles: ['admin_roles'],
    admin_role_edit: ['admin_roles', 'admin_permissions'],
    admin_permissions: ['admin_permissions'],
  },
  activeCustomersPage: {
    customer_list: ['customers'],
    customer_edit: ['customers'],
    customer_view: ['customers'],
    customer_login_as: ['customers'],
    ip_block: ['ip_block'],
  },
};

export const SECTION_DEFAULTS = {
  products: { activeProductPage: 'product_manage' },
  supplier: { activeSupplierPage: 'supplier_list' },
  purchase: { activePurchasePage: 'purchase_list' },
  landing: { activeLandingPage: 'landing_manage' },
  admin: { activeAdminPage: 'admin_user' },
  customers: { activeCustomersPage: 'customer_list' },
  website: { activeWebsitePage: 'general_setting' },
  api: { activeApiPage: 'courier_api' },
  marketing: { activeMarketingPage: 'tag_manager' },
  blogs: { activeBlogsPage: 'blog' },
  banner: { activeBannerPage: 'banner_category' },
  expense: { activeExpensePage: 'expense_categories' },
  reports: { activeReportsPage: 'stock_report' },
};

// Sections whose pages can be granted one by one as "<section>.<page>"
// (MENU_SUB_PERMISSIONS in the backend). The state value names the page;
// create/edit screens belong to the page they open from.
const PAGED_SECTIONS = {
  products: {
    section: 'products', stateKey: 'activeProductPage',
    pages: ['product_manage', 'categories', 'subcategories', 'childcategories', 'brands', 'attribute', 'barcode', 'reviews'],
  },
  supplier: {
    section: 'supplier', stateKey: 'activeSupplierPage',
    pages: ['supplier_list', 'supplier_add', 'payment_add', 'payment_list'],
    aliases: { supplier_edit: 'supplier_list', payment_edit: 'payment_list' },
  },
  purchase: {
    section: 'purchase', stateKey: 'activePurchasePage',
    pages: ['purchase_list', 'purchase_add'],
    aliases: { purchase_edit: 'purchase_list' },
  },
  website: {
    section: 'website_setting', stateKey: 'activeWebsitePage',
    pages: ['general_setting', 'order_block', 'website_footer', 'social_media', 'contact', 'shipping_charge', 'order_status', 'create_page'],
    aliases: { page_edit: 'create_page' },
  },
  api: {
    section: 'api_integration', stateKey: 'activeApiPage',
    pages: ['courier_api', 'payment_gateway', 'sms_gateway', 'fraud_checker_api'],
  },
  marketing: {
    section: 'marketing_tools', stateKey: 'activeMarketingPage',
    pages: ['tag_manager', 'facebook_pixels', 'tiktok_pixels', 'google_ads', 'coupon_code', 'sms_marketing', 'facebook_catalogue', 'visitor_reports'],
  },
  banner: {
    section: 'banner_ads', stateKey: 'activeBannerPage',
    pages: ['banner_category', 'banner_ads'],
  },
  expense: {
    section: 'expense', stateKey: 'activeExpensePage',
    pages: ['expense_categories', 'expense'],
    aliases: { expense_category_create: 'expense_categories', expense_category_edit: 'expense_categories' },
  },
  reports: {
    section: 'reports', stateKey: 'activeReportsPage',
    pages: ['stock_report', 'stock_alert_report', 'purchase_report', 'order_reports', 'sales_reports', 'expense_reports', 'loss_profit'],
  },
};

function pagedSectionPage(config, value) {
  const key = config.aliases?.[value] || String(value || '').replace(/_(create|edit)$/, '');
  return config.pages.includes(key) ? key : null;
}

const SUBPAGE_STATE_BY_PAGE = {
  landing: 'activeLandingPage',
  admin: 'activeAdminPage',
  customers: 'activeCustomersPage',
  ...Object.fromEntries(Object.entries(PAGED_SECTIONS).map(([page, config]) => [page, config.stateKey])),
};

// The permissions for a sub page; create/edit screens use their page's.
function subpagePermissions(activePage, stateKey, value) {
  const direct = SUBPAGE_PERMISSION_MAP[stateKey]?.[value];
  if (direct) return direct;
  const config = PAGED_SECTIONS[activePage];
  const page = config && pagedSectionPage(config, value);
  return page ? [`${config.section}.${page}`] : null;
}

export const FIRST_SUBPAGE_BY_PERMISSION = {
  activeLandingPage: [
    ['landing_page', 'landing_manage'],
    ['landing_page_header', 'landing_header'],
    ['landing_page_footer', 'landing_footer'],
  ],
  activeAdminPage: [
    ['admin_user', 'admin_user'],
    ['admin_roles', 'admin_roles'],
    ['admin_permissions', 'admin_permissions'],
  ],
  activeCustomersPage: [
    ['customers', 'customer_list'],
    ['ip_block', 'ip_block'],
  ],
};

Object.values(PAGED_SECTIONS).forEach((config) => {
  SUBPAGE_PERMISSION_MAP[config.stateKey] = Object.fromEntries(
    config.pages.map((page) => [page, [`${config.section}.${page}`]]),
  );
  FIRST_SUBPAGE_BY_PERMISSION[config.stateKey] = config.pages.map((page) => [`${config.section}.${page}`, page]);
});

export const NAVIGATION_ORDER = [
  ['dashboard', { activePage: 'dashboard' }],
  ['orders', { activePage: 'orders', activeOrderStatus: 'all' }],
  ['products', { activePage: 'products', activeProductPage: 'product_manage' }],
  ['supplier', { activePage: 'supplier', activeSupplierPage: 'supplier_list' }],
  ['purchase', { activePage: 'purchase', activePurchasePage: 'purchase_list' }],
  ['landing_page', { activePage: 'landing', activeLandingPage: 'landing_manage' }],
  ['landing_page_header', { activePage: 'landing', activeLandingPage: 'landing_header' }],
  ['landing_page_footer', { activePage: 'landing', activeLandingPage: 'landing_footer' }],
  ['admin_user', { activePage: 'admin', activeAdminPage: 'admin_user' }],
  ['admin_roles', { activePage: 'admin', activeAdminPage: 'admin_roles' }],
  ['admin_permissions', { activePage: 'admin', activeAdminPage: 'admin_permissions' }],
  ['customers', { activePage: 'customers', activeCustomersPage: 'customer_list' }],
  ['ip_block', { activePage: 'customers', activeCustomersPage: 'ip_block' }],
  ['scratch_card', { activePage: 'scratch_card' }],
  ['scratch_card_repeat', { activePage: 'scratch_card' }],
  ['scratch_card_prize', { activePage: 'scratch_card_prize' }],
  ['website_setting', { activePage: 'website', activeWebsitePage: 'general_setting' }],
  ['api_integration', { activePage: 'api', activeApiPage: 'courier_api' }],
  ['marketing_tools', { activePage: 'marketing', activeMarketingPage: 'tag_manager' }],
  ['blogs', { activePage: 'blogs', activeBlogsPage: 'blog' }],
  ['banner_ads', { activePage: 'banner', activeBannerPage: 'banner_category' }],
  ['expense', { activePage: 'expense', activeExpensePage: 'expense_categories' }],
  ['reports', { activePage: 'reports', activeReportsPage: 'stock_report' }],
];

export function getPermissionSet(user) {
  const role = normalize(user?.role).replace(/[\s_-]+/g, '');
  if (PRIVILEGED_ROLES.has(role) || role === 'superadmin') {
    return new Set([
      ...NAVIGATION_ORDER.map(([permission]) => permission),
      'cache_clear',
    ]);
  }
  return new Set((user?.menuPermissions || []).map(normalizePermission).filter(Boolean));
}

export function hasAnyPermission(permissionSet, permissions = []) {
  return permissions.some((permission) => hasPermission(permissionSet, permission));
}

// "section" also counts any of its page keys ("section.page"). A page key is
// granted by itself, or by the section key while the role has no page keys
// of that section; once it has some, it gets only those pages.
export function hasPermission(permissionSet, permission) {
  const key = normalizePermission(permission);
  if (permissionSet.has(key)) return true;
  const [section, page] = key.split('.');
  const hasPageKeys = [...permissionSet].some((p) => p.startsWith(`${section}.`));
  return page ? !hasPageKeys && permissionSet.has(section) : hasPageKeys;
}

export function getFirstAllowedNavigation(permissionSet) {
  const match = NAVIGATION_ORDER.find(([permission]) => hasPermission(permissionSet, permission));
  return match ? match[1] : null;
}

function withPermittedSubpage(state, permissionSet) {
  const stateKey = SUBPAGE_STATE_BY_PAGE[state.activePage];
  if (!stateKey) return state;

  const pagePermissions = subpagePermissions(state.activePage, stateKey, state[stateKey]);
  if (!pagePermissions || hasAnyPermission(permissionSet, pagePermissions)) return state;

  const fallback = FIRST_SUBPAGE_BY_PERMISSION[stateKey]?.find(([permission]) =>
    hasPermission(permissionSet, permission),
  );

  return fallback ? { ...state, [stateKey]: fallback[1] } : state;
}

export function normalizeNavigationForPermissions(state, permissionSet) {
  if (!permissionSet) return state;
  if (!permissionSet.size) return state;
  if (hasAnyPermission(permissionSet, PAGE_PERMISSION_MAP[state.activePage] || [])) {
    return withPermittedSubpage(state, permissionSet);
  }
  const fallback = getFirstAllowedNavigation(permissionSet);
  return fallback ? withPermittedSubpage({ ...state, ...fallback }, permissionSet) : state;
}

export function isNavigationAllowed(state, permissionSet) {
  if (!permissionSet) return true;
  if (!permissionSet.size) return false;
  if (!hasAnyPermission(permissionSet, PAGE_PERMISSION_MAP[state.activePage] || [])) return false;

  const stateKey = SUBPAGE_STATE_BY_PAGE[state.activePage];
  if (!stateKey) return true;

  const permissions = subpagePermissions(state.activePage, stateKey, state[stateKey]);
  return !permissions || hasAnyPermission(permissionSet, permissions);
}

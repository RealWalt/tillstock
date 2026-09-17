export const AVAILABLE_PERMISSIONS = [
  // Gestión de productos
  { key: 'view_products', label: 'Ver productos', group: 'Gestión de productos' },
  { key: 'create_products', label: 'Crear productos', group: 'Gestión de productos' },
  { key: 'edit_products', label: 'Editar productos', group: 'Gestión de productos' },
  { key: 'delete_products', label: 'Eliminar productos', group: 'Gestión de productos' },
  { key: 'view_services', label: 'Ver servicios', group: 'Gestión de productos' },
  { key: 'create_services', label: 'Crear servicios', group: 'Gestión de productos' },
  { key: 'edit_services', label: 'Editar servicios', group: 'Gestión de productos' },
  { key: 'delete_services', label: 'Eliminar servicios', group: 'Gestión de productos' },
  
  // Categorías y proveedores
  { key: 'view_categories', label: 'Ver categorías', group: 'Categorías y proveedores' },
  { key: 'create_categories', label: 'Crear categorías', group: 'Categorías y proveedores' },
  { key: 'edit_categories', label: 'Editar categorías', group: 'Categorías y proveedores' },
  { key: 'delete_categories', label: 'Eliminar categorías', group: 'Categorías y proveedores' },
  { key: 'view_suppliers', label: 'Ver proveedores', group: 'Categorías y proveedores' },
  { key: 'create_suppliers', label: 'Crear proveedores', group: 'Categorías y proveedores' },
  { key: 'edit_suppliers', label: 'Editar proveedores', group: 'Categorías y proveedores' },
  { key: 'delete_suppliers', label: 'Eliminar proveedores', group: 'Categorías y proveedores' },
  
  // Ventas y POS
  { key: 'access_pos', label: 'Acceso al POS', group: 'Ventas y POS' },
  { key: 'manage_transactions', label: 'Gestionar transacciones', group: 'Ventas y POS' },
  { key: 'open_close_shifts', label: 'Abrir/cerrar turnos', group: 'Ventas y POS' },
  { key: 'view_sales_reports', label: 'Ver reportes de ventas', group: 'Ventas y POS' },
  { key: 'view_expenses', label: 'Ver gastos', group: 'Ventas y POS' },
  { key: 'export_reports', label: 'Exportar reportes', group: 'Ventas y POS' },

  // Personal
  { key: 'manage_employees', label: 'Gestionar empleados', group: 'Personal' },
  { key: 'manage_cashiers', label: 'Gestionar cajeros', group: 'Personal' },
  { key: 'manage_roles', label: 'Gestionar roles y permisos', group: 'Personal' },
  { key: 'manage_pos_terminals', label: 'Gestionar cajas POS', group: 'Personal' },  // ← nuevo


  // Configuración
  { key: 'manage_settings', label: 'Configuración de la tienda', group: 'Configuración' },
] as const

export type PermissionKey = typeof AVAILABLE_PERMISSIONS[number]['key']
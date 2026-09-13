import { AVAILABLE_PERMISSIONS } from "./permissions"

export const DEFAULT_ROLES = [
  {
    name: 'Administrador',
    description: 'Acceso completo a todas las funcionalidades del sistema.',
    permissions: AVAILABLE_PERMISSIONS.map(p => p.key),
  },
  {
    name: 'Gerente',
    description: 'Gestión de productos, reportes y control de inventario.',
    permissions: [
      'view_products', 'create_products', 'edit_products',
      'view_services', 'create_services', 'edit_services',
      'view_categories', 'create_categories', 'edit_categories',
      'view_suppliers', 'create_suppliers', 'edit_suppliers',
      'view_sales_reports', 'view_expenses', 'export_reports',
      'access_pos', 'manage_transactions',
    ],
  },
  {
    name: 'Cajero',
    description: 'Solo acceso a ventas y operaciones de caja.',
    permissions: ['access_pos', 'manage_transactions', 'open_close_shifts'],
  },
]
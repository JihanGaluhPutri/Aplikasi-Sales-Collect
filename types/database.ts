import type { Customer, CustomerInsert, CustomerUpdate } from '@/types/customer';
import type {
  CollectionReportSummaryRow,
  DashboardSummaryRow,
  SalesReportRowDb,
} from '@/types/dashboard';
import type {
  Invoice,
  InvoiceInsert,
  InvoiceStatus,
  InvoiceStatusHistory,
  InvoiceStatusHistoryInsert,
  InvoiceStatusHistoryUpdate,
  InvoiceUpdate,
} from '@/types/invoice';
import type { Sales, SalesInsert, SalesUpdate } from '@/types/sales';
import type { Profile, ProfileInsert, ProfileUpdate, UserRole } from '@/types/user';

/**
 * Definisi tipe database Supabase yang dipakai aplikasi.
 * Nilai Row/Insert/Update/Relationships/Functions harus selalu konsisten
 * dengan migration di folder `supabase/migrations`.
 *
 * Relationships dibutuhkan supabase-js untuk menyelesaikan embed query
 * seperti `select('*, customers(name)')`.
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      sales: {
        Row: Sales;
        Insert: SalesInsert;
        Update: SalesUpdate;
        Relationships: [
          {
            foreignKeyName: 'sales_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      customers: {
        Row: Customer;
        Insert: CustomerInsert;
        Update: CustomerUpdate;
        Relationships: [];
      };
      invoices: {
        Row: Invoice;
        Insert: InvoiceInsert;
        Update: InvoiceUpdate;
        Relationships: [
          {
            foreignKeyName: 'invoices_customer_id_fkey';
            columns: ['customer_id'];
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoices_sales_id_fkey';
            columns: ['sales_id'];
            referencedRelation: 'sales';
            referencedColumns: ['id'];
          },
        ];
      };
      invoice_status_history: {
        Row: InvoiceStatusHistory;
        Insert: InvoiceStatusHistoryInsert;
        Update: InvoiceStatusHistoryUpdate;
        Relationships: [
          {
            foreignKeyName: 'invoice_status_history_invoice_id_fkey';
            columns: ['invoice_id'];
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoice_status_history_changed_by_fkey';
            columns: ['changed_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      /** TB-63/TB-64: update status invoice secara atomic + history. */
      update_invoice_status: {
        Args: {
          p_invoice_id: string;
          p_new_status: InvoiceStatus;
        };
        Returns: Invoice;
      };
      /** TB-73: agregasi dashboard (admin maupun sales - di-scope oleh RLS). */
      dashboard_summary: {
        Args: Record<string, never>;
        Returns: DashboardSummaryRow[];
      };
      /** TB-78: agregasi collection report per periode (invoice_date). */
      collection_report_summary: {
        Args: {
          p_start: string;
          p_end: string;
        };
        Returns: CollectionReportSummaryRow[];
      };
      /** TB-79: distribusi invoice per sales pada periode (tanpa ranking). */
      collection_report_by_sales: {
        Args: {
          p_start: string;
          p_end: string;
        };
        Returns: SalesReportRowDb[];
      };
    };
    Enums: {
      user_role: UserRole;
      invoice_status: InvoiceStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

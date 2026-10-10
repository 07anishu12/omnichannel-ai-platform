export const SYNTHETIC_TENANTS = [
  { id: "tenant-synthetic-a", name: "Synthetic Tenant A" },
  { id: "tenant-synthetic-b", name: "Synthetic Tenant B" },
] as const;

export type SyntheticTenantId = (typeof SYNTHETIC_TENANTS)[number]["id"];

export type TenantScopedStore<T extends { tenantId: string }> = {
  insert(record: T): void;
  findById(tenantId: string, id: string): T | undefined;
  list(tenantId: string): T[];
};

export function createTenantScopedStore<
  T extends { tenantId: string; id: string },
>(): TenantScopedStore<T> {
  const records: T[] = [];
  return {
    insert(record) {
      records.push(record);
    },
    findById(tenantId, id) {
      return records.find((record) => record.tenantId === tenantId && record.id === id);
    },
    list(tenantId) {
      return records.filter((record) => record.tenantId === tenantId);
    },
  };
}

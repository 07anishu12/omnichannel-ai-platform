import assert from "node:assert/strict";
import test from "node:test";
import { createFakeOutboundAdapter } from "./index.js";
import { SYNTHETIC_TENANTS, createTenantScopedStore } from "./tenant-fixtures.js";

const [tenantA, tenantB] = SYNTHETIC_TENANTS;

type Contact = { id: string; tenantId: string; name: string };

test("synthetic fixtures define two distinct unrelated tenants", () => {
  assert.equal(SYNTHETIC_TENANTS.length, 2);
  assert.notEqual(tenantA.id, tenantB.id);
});

test("a tenant-scoped read cannot return another tenant's record by id", () => {
  const store = createTenantScopedStore<Contact>();
  store.insert({ id: "c-1", tenantId: tenantA.id, name: "Synthetic A contact" });
  assert.equal(store.findById(tenantB.id, "c-1"), undefined);
  assert.equal(store.findById(tenantA.id, "c-1")?.name, "Synthetic A contact");
});

test("a tenant-scoped list never includes another tenant's records", () => {
  const store = createTenantScopedStore<Contact>();
  store.insert({ id: "c-1", tenantId: tenantA.id, name: "A" });
  store.insert({ id: "c-2", tenantId: tenantB.id, name: "B" });
  assert.deepEqual(
    store.list(tenantA.id).map((record) => record.id),
    ["c-1"],
  );
  assert.deepEqual(
    store.list(tenantB.id).map((record) => record.id),
    ["c-2"],
  );
});

test("an outbound send is recorded only under the tenant that initiated it", async () => {
  const adapter = createFakeOutboundAdapter();
  await adapter.send("message", tenantA.id, { text: "synthetic" });
  const tenantBCalls = adapter.calls.filter((call) => call.tenantId === tenantB.id);
  assert.equal(tenantBCalls.length, 0);
  assert.equal(adapter.calls[0]?.tenantId, tenantA.id);
});

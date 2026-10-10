import assert from "node:assert/strict";
import test from "node:test";
import { createFakeOutboundAdapter } from "./index.js";

test("fake outbound adapter records each send with its kind and tenant", async () => {
  const adapter = createFakeOutboundAdapter();
  await adapter.send("message", "tenant-a", { text: "hello" });
  await adapter.send("voice", "tenant-b", { script: "hi" });
  assert.deepEqual(adapter.calls, [
    { kind: "message", tenantId: "tenant-a", payload: { text: "hello" } },
    { kind: "voice", tenantId: "tenant-b", payload: { script: "hi" } },
  ]);
});

test("fake outbound adapter returns sequential provider message ids", async () => {
  const adapter = createFakeOutboundAdapter();
  assert.deepEqual(await adapter.send("message", "tenant-a", {}), {
    providerMessageId: "fake-1",
  });
  assert.deepEqual(await adapter.send("message", "tenant-a", {}), {
    providerMessageId: "fake-2",
  });
});

test("fake outbound adapters do not share recorded calls", () => {
  const first = createFakeOutboundAdapter();
  const second = createFakeOutboundAdapter();
  assert.notEqual(first.calls, second.calls);
  assert.equal(second.calls.length, 0);
});

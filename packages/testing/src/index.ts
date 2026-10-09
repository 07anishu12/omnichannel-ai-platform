export type FakeOutboundCall = {
  kind: "message" | "voice";
  tenantId: string;
  payload: unknown;
};

export function createFakeOutboundAdapter() {
  const calls: FakeOutboundCall[] = [];
  return {
    calls,
    async send(kind: FakeOutboundCall["kind"], tenantId: string, payload: unknown) {
      calls.push({ kind, tenantId, payload });
      return { providerMessageId: `fake-${calls.length}` };
    },
  };
}

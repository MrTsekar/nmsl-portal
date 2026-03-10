import { useMocks } from "@/lib/api/client";

export async function withMockFallback<T>({
  live,
  mock,
}: {
  live: () => Promise<T>;
  mock: () => Promise<T>;
}) {
  if (useMocks) return mock();

  try {
    return await live();
  } catch {
    return mock();
  }
}

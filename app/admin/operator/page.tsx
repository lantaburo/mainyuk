import { requireSuperAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OperatorListClient } from "./OperatorListClient";

export const metadata = {
  title: "Manajemen Operator | mainyuk.my.id",
};

export default async function OperatorManagementPage() {
  await requireSuperAdmin();

  const operators = await prisma.user.findMany({
    where: { role: "operator" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Operator</h1>
        <p className="text-muted-foreground mt-1">
          Kelola akun staf/operator yang memiliki akses ke dashboard admin tenant.
        </p>
      </div>

      <OperatorListClient initialOperators={operators} />
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BankAccount {
  bank: string;
  accountNumber: string;
  accountName: string;
}

export function BankAccountsEditor({
  initial,
  action,
}: {
  initial: BankAccount[];
  action: (accounts: BankAccount[]) => Promise<void>;
}) {
  const [accounts, setAccounts] = useState<BankAccount[]>(initial);
  const [isPending, startTransition] = useTransition();

  function update(index: number, field: keyof BankAccount, value: string) {
    setAccounts((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  }

  function handleSave() {
    startTransition(async () => {
      await action(accounts.filter((a) => a.bank && a.accountNumber));
      toast.success("Rekening disimpan");
    });
  }

  return (
    <div className="space-y-3">
      {accounts.map((account, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
          <Input
            placeholder="Nama Bank"
            value={account.bank}
            onChange={(e) => update(i, "bank", e.target.value)}
          />
          <Input
            placeholder="No. Rekening"
            value={account.accountNumber}
            onChange={(e) => update(i, "accountNumber", e.target.value)}
          />
          <Input
            placeholder="Atas Nama"
            value={account.accountName}
            onChange={(e) => update(i, "accountName", e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAccounts((prev) => prev.filter((_, idx) => idx !== i))}
          >
            Hapus
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setAccounts((prev) => [...prev, { bank: "", accountNumber: "", accountName: "" }])
          }
        >
          + Tambah Rekening
        </Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan Rekening"}
        </Button>
      </div>
    </div>
  );
}

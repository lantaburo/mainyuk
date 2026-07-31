import { Role } from "@/lib/generated/prisma/enums";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    storeId: string | null;
    originalRole?: Role;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: Role;
      storeId: string | null;
      originalRole?: Role;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    storeId: string | null;
    originalRole?: Role;
  }
}

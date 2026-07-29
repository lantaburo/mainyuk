import { Role } from "@/lib/generated/prisma/enums";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    storeId: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: Role;
      storeId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    storeId: string | null;
  }
}

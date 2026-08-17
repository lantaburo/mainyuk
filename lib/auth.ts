import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { stores: { select: { id: true }, take: 1 } },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          storeId: user.stores[0]?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        if (account.provider === "google") {
          // Google OAuth Login
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { stores: { select: { id: true }, take: 1 } },
          });

          if (!dbUser) {
            // Auto-register
            const randomPassword = Math.random().toString(36).slice(-10) + Date.now().toString(36);
            const passwordHash = await bcrypt.hash(randomPassword, 10);
            
            dbUser = await prisma.user.create({
              data: {
                name: user.name || "Google User",
                email: user.email!,
                passwordHash,
                role: "customer", // Default role
              },
              include: { stores: { select: { id: true }, take: 1 } },
            });
          }

          token.sub = dbUser.id;
          token.role = dbUser.role;
          token.storeId = dbUser.stores[0]?.id || null;
        } else {
          // Credentials Login
          token.sub = user.id;
          token.role = user.role;
          token.storeId = user.storeId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role;
        session.user.storeId = token.storeId;

        // Impersonation logic
        if (token.role === "super_admin" || token.role === "operator") {
          const cookieStore = cookies();
          const impersonateStoreId = cookieStore.get("impersonate_store_id")?.value;
          
          if (impersonateStoreId) {
            session.user.originalRole = token.role;
            session.user.role = "store_owner";
            session.user.storeId = impersonateStoreId;
          }
        }
      }
      return session;
    },
  },
};

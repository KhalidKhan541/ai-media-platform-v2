import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { db } from "./db";
import { config } from "./config";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      username: string | null;
      avatar: string | null;
      role: UserRole;
      isVerified: boolean;
      isPremium: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    username: string | null;
    avatar: string | null;
    role: UserRole;
    isVerified: boolean;
    isPremium: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string | null;
    username: string | null;
    avatar: string | null;
    role: UserRole;
    isVerified: boolean;
    isPremium: boolean;
  }
}

function getProviders(): NextAuthOptions["providers"] {
  const providers: NextAuthOptions["providers"] = [];

  if (config.auth.providers.google.clientId) {
    providers.push(
      GoogleProvider({
        clientId: config.auth.providers.google.clientId!,
        clientSecret: config.auth.providers.google.clientSecret!,
        profile(profile) {
          return {
            id: profile.sub,
            email: profile.email,
            name: profile.name,
            image: profile.picture,
            username: null,
            role: "USER" as UserRole,
            isVerified: false,
            isPremium: false,
          };
        },
      })
    );
  }

  if (config.auth.providers.github.clientId) {
    providers.push(
      GitHubProvider({
        clientId: config.auth.providers.github.clientId!,
        clientSecret: config.auth.providers.github.clientSecret!,
        profile(profile) {
          return {
            id: String(profile.id),
            email: profile.email,
            name: profile.name || profile.login,
            image: profile.avatar_url,
            username: profile.login,
            role: "USER" as UserRole,
            isVerified: false,
            isPremium: false,
          };
        },
      })
    );
  }

  providers.push(
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.isActive) {
          throw new Error("Invalid email or password");
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
          isPremium: user.isPremium,
        };
      },
    })
  );

  return providers;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
    newUser: "/onboarding",
  },
  providers: getProviders(),
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.username = user.username;
        token.avatar = user.image;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.isPremium = user.isPremium;
      }

      if (trigger === "update" && session) {
        token.name = session.user.name ?? token.name;
        token.avatar = session.user.avatar ?? token.avatar;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.username = token.username;
        session.user.avatar = token.avatar;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
        session.user.isPremium = token.isPremium;
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      if (!user?.email) return false;

      const existingUser = await db.user.findUnique({
        where: { email: user.email.toLowerCase() },
      });

      if (existingUser) {
        await db.user.update({
          where: { id: existingUser.id },
          data: { lastLoginAt: new Date() },
        });
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user }) {
      if (user?.id) {
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: "SIGN_IN",
            resource: "AUTH",
            resourceId: user.id,
          },
        });
      }
    },
    async signOut({ token }) {
      if (token?.id) {
        await db.auditLog.create({
          data: {
            userId: token.id as string,
            action: "SIGN_OUT",
            resource: "AUTH",
            resourceId: token.id as string,
          },
        });
      }
    },
  },
  secret: config.auth.secret,
  debug: config.app.isDevelopment,
};

export function getSession() {
  return import("next-auth").then((mod) => mod.getSession());
}

export function requireAuth() {
  return getSession().then((session) => {
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    return session;
  });
}

export function requireRole(role: UserRole) {
  return requireAuth().then((session) => {
    const roleHierarchy: Record<UserRole, number> = {
      USER: 0,
      CREATOR: 1,
      MODERATOR: 2,
      ADMIN: 3,
      SUPER_ADMIN: 4,
    };

    if (roleHierarchy[session.user.role] < roleHierarchy[role]) {
      throw new Error("Forbidden");
    }

    return session;
  });
}

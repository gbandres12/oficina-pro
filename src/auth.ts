import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import { compare } from "bcrypt-ts";
import { db } from "@/lib/db";
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession["user"];
    }
}

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    try {
                        // Log de tentativa no banco
                        await db.query('INSERT INTO "DebugLog" (message) VALUES ($1)', [`Tentativa de login: ${email}`]);

                        const user = await db.fetchOne('SELECT * FROM "User" WHERE email = $1', [email]);

                        if (!user) {
                            await db.query('INSERT INTO "DebugLog" (message) VALUES ($1)', [`Falha login: Usuário não encontrado - ${email}`]);
                            console.error('[AUTH] Falha: Usuário não encontrado no banco:', email);
                            return null;
                        }

                        const passwordsMatch = await compare(password, user.password);

                        if (!passwordsMatch) {
                            await db.query('INSERT INTO "DebugLog" (message) VALUES ($1)', [`Falha login: Senha incorreta - ${email}`]);
                            console.error('[AUTH] Falha: Senha incorreta para:', email);
                            return null;
                        }

                        await db.query('INSERT INTO "DebugLog" (message) VALUES ($1)', [`Sucesso login: ${email}`]);
                        console.log('[AUTH] Sucesso: Usuário autenticado:', email);

                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                        };
                    } catch (dbError: any) {
                        console.error('[AUTH] ERRO CRÍTICO no Banco de Dados:', dbError);
                        return null;
                    }
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async session({ session, token }: any) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
    },
});

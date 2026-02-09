import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt-ts";
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
                        const user = await prisma.user.findUnique({ where: { email } });

                        if (!user) {
                            console.error('[AUTH] Falha: Usuário não encontrado no banco:', email);
                            return null;
                        }

                        const passwordsMatch = await compare(password, user.password);

                        if (!passwordsMatch) {
                            console.error('[AUTH] Falha: Senha incorreta para:', email);
                            return null;
                        }

                        console.log('[AUTH] Sucesso: Usuário autenticado:', email);
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                        };
                    } catch (dbError) {
                        console.error('[AUTH] ERRO CRÍTICO no Banco de Dados:', dbError);
                        return null;
                    }
                }

                return null;
            },
        }),
    ],
});

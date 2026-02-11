import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import { compare } from "bcrypt-ts";
import { supabase } from "@/lib/supabase";
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
                        console.log('[AUTH] Tentativa de login via SDK para:', email);

                        const { data: user, error } = await supabase
                            .from('User')
                            .select('*')
                            .eq('email', email)
                            .single();

                        if (error || !user) {
                            console.error('[AUTH] Usuário não encontrado ou erro no SDK:', error?.message);
                            return null;
                        }

                        const passwordsMatch = await compare(password, user.password);

                        if (!passwordsMatch) {
                            console.error('[AUTH] Senha incorreta para:', email);
                            return null;
                        }

                        console.log('[AUTH] Sucesso SDK!');
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                        };
                    } catch (err: any) {
                        console.error('[AUTH] ERRO INESPERADO SDK:', err.message);
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

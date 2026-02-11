"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [regLoading, setRegLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [open, setOpen] = useState(false);

    // Registration state
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Credenciais inválidas");
            } else {
                toast.success("Login realizado com sucesso");
                router.push("/dashboard");
                router.refresh();
            }
        } catch (error: unknown) {
            console.error('Login error:', error);
            toast.error("Ocorreu um erro ao fazer login");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Erro ao cadastrar");
            } else {
                toast.success("Cadastro realizado! Você já pode entrar.");
                setOpen(false);
                setEmail(regEmail);
                setRegName("");
                setRegEmail("");
                setRegPassword("");
            }
        } catch (error) {
            toast.error("Erro na rede ao cadastrar");
        } finally {
            setRegLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 px-4">
            <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center uppercase tracking-tighter">Oficina Pro</CardTitle>
                    <CardDescription className="text-center font-medium">
                        Gerenciamento inteligente para sua oficina
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@andres.com"
                                    className="pl-10 h-11 rounded-xl"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-10 h-11 rounded-xl"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20" type="submit" disabled={loading}>
                            {loading ? "Entrando..." : "Entrar no Sistema"}
                        </Button>

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" className="w-full gap-2 text-slate-500 font-bold hover:text-primary transition-colors">
                                    <UserPlus className="w-4 h-4" /> Criar nova conta
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold">Cadastre sua Oficina</DialogTitle>
                                    <DialogDescription>
                                        Inicie seu gerenciamento profissional agora mesmo.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleRegister} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-name">Nome da Oficina ou Proprietário</Label>
                                        <Input
                                            id="reg-name"
                                            className="h-11 rounded-xl"
                                            value={regName}
                                            onChange={(e) => setRegName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-email">E-mail profissional</Label>
                                        <Input
                                            id="reg-email"
                                            type="email"
                                            className="h-11 rounded-xl"
                                            value={regEmail}
                                            onChange={(e) => setRegEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-pass">Senha (mínimo 6 caracteres)</Label>
                                        <Input
                                            id="reg-pass"
                                            type="password"
                                            className="h-11 rounded-xl"
                                            value={regPassword}
                                            onChange={(e) => setRegPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button className="w-full h-11 rounded-xl font-bold" type="submit" disabled={regLoading}>
                                        {regLoading ? "Criando conta..." : "Registrar Oficina"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

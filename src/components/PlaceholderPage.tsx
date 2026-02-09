import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PlaceholderPage({ title, description }: { title: string, description: string }) {
    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight">{title}</h1>
                <p className="text-muted-foreground font-medium">{description}</p>
            </div>

            <Card className="border-none shadow-xl bg-slate-100/50 dark:bg-slate-900/50 border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Badge variant="outline" className="text-primary font-bold">Módulo em Breve</Badge>
                    </div>
                    <p className="text-slate-500 font-medium">
                        Estamos preparando este módulo para você. <br />
                        Em breve todas as funcionalidades de <strong>{title}</strong> estarão disponíveis.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

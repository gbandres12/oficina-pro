"use client";

import React, { useState } from 'react';
import {
    ShoppingCart,
    Search,
    Plus,
    Minus,
    Trash2,
    CheckCircle2,
    CreditCard,
    Banknote,
    QrCode
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
}

interface CartItem extends Product {
    quantity: number;
}

export default function PDVPage() {
    const products: Product[] = [
        { id: '1', name: 'Óleo 5W30 Sintético', price: 65.00, stock: 45, category: 'Lubrificantes' },
        { id: '2', name: 'Filtro de Óleo - PH5548', price: 35.00, stock: 12, category: 'Filtros' },
        { id: '3', name: 'Pastilha de Freio Dianteira', price: 185.00, stock: 8, category: 'Freios' },
        { id: '4', name: 'Lâmpada H7 Halógena', price: 45.00, stock: 24, category: 'Iluminação' },
        { id: '5', name: 'Aditivo para Radiador', price: 28.00, stock: 30, category: 'Arrefecimento' },
    ];

    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [invoiceCustomer, setInvoiceCustomer] = useState('Consumidor Final');
    const [invoiceDocument, setInvoiceDocument] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'DINHEIRO' | 'CARTAO' | 'PIX' | null>(null);
    const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

    const addToCart = (product: Product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        toast.success(`${product.name} adicionado`);
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleSelectPayment = (method: 'DINHEIRO' | 'CARTAO' | 'PIX') => {
        setPaymentMethod(method);
        toast.success(`Pagamento selecionado: ${method}`);
    };

    const handleFinalizeSale = () => {
        if (!paymentMethod) {
            toast.error('Selecione uma forma de pagamento antes de finalizar a venda.');
            return;
        }

        toast.success('Venda finalizada com sucesso.');
    };

    const handleIssueInvoice = () => {
        if (cart.length === 0) {
            toast.error('Adicione ao menos um produto para emitir NF-e.');
            return;
        }

        if (!paymentMethod) {
            toast.error('Selecione uma forma de pagamento para emissão da NF-e.');
            return;
        }

        const invoiceNumber = `${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
        toast.success(`NF-e ${invoiceNumber} emitida para ${invoiceCustomer}.`);
        setIsInvoiceDialogOpen(false);
    };

    return (
        <div className="p-6 h-[calc(100vh-64px)] flex flex-col lg:flex-row gap-6">
            {/* Products Section */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-border/50">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar produto ou código de barras..."
                            className="pl-9 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 rounded-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                        {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                            <Card key={product.id} className="group hover:shadow-md transition-all cursor-pointer border-border/50" onClick={() => addToCart(product)}>
                                <CardHeader className="p-4">
                                    <Badge variant="secondary" className="w-fit text-[10px] uppercase tracking-wider">{product.category}</Badge>
                                    <CardTitle className="text-base font-bold mt-2">{product.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-[10px] text-muted-foreground uppercase font-bold">Preço</div>
                                            <div className="text-lg font-black text-primary">R$ {product.price.toFixed(2)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-muted-foreground uppercase font-bold">Estoque</div>
                                            <div className="text-sm font-bold">{product.stock} un</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Cart Section */}
            <div className="w-full lg:w-[400px] flex flex-col gap-4">
                <Card className="flex-1 flex flex-col shadow-xl border-none overflow-hidden">
                    <CardHeader className="bg-primary text-primary-foreground p-6">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="w-6 h-6" />
                            <div>
                                <CardTitle className="text-xl font-bold">Carrinho</CardTitle>
                                <div className="text-xs opacity-80 uppercase tracking-widest font-bold">{cart.length} itens selecionados</div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <ScrollArea className="h-full px-6 py-4">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 text-center">
                                    <ShoppingCart className="w-12 h-12 mb-4" />
                                    <p className="font-bold">CARRINHO VAZIO</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 group">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm truncate">{item.name}</div>
                                                <div className="text-[10px] text-muted-foreground font-bold">R$ {item.price.toFixed(2)} / un</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg" onClick={() => updateQuantity(item.id, -1)}>
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                                                <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg" onClick={() => updateQuantity(item.id, 1)}>
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeFromCart(item.id)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="flex-col gap-4 p-6 border-t bg-slate-50 dark:bg-slate-900">
                        <div className="w-full space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Subtotal</span>
                                <span className="font-bold">R$ {total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-black">
                                <span>TOTAL</span>
                                <span className="text-primary">R$ {total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 w-full">
                            <Button
                                variant={paymentMethod === 'DINHEIRO' ? 'default' : 'outline'}
                                className="flex-col h-16 gap-1 rounded-xl"
                                onClick={() => handleSelectPayment('DINHEIRO')}
                            >
                                <Banknote className="w-4 h-4" />
                                <span className="text-[10px] font-bold">DINHEIRO</span>
                            </Button>
                            <Button
                                variant={paymentMethod === 'CARTAO' ? 'default' : 'outline'}
                                className="flex-col h-16 gap-1 rounded-xl"
                                onClick={() => handleSelectPayment('CARTAO')}
                            >
                                <CreditCard className="w-4 h-4" />
                                <span className="text-[10px] font-bold">CARTÃO</span>
                            </Button>
                            <Button
                                variant={paymentMethod === 'PIX' ? 'default' : 'outline'}
                                className="flex-col h-16 gap-1 rounded-xl"
                                onClick={() => handleSelectPayment('PIX')}
                            >
                                <QrCode className="w-4 h-4" />
                                <span className="text-[10px] font-bold">PIX</span>
                            </Button>
                        </div>

                        <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full rounded-xl" disabled={cart.length === 0}>
                                    Emitir NF-e de Produtos
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Emitir NF-e de Produtos</DialogTitle>
                                    <DialogDescription>
                                        Preencha os dados do destinatário para gerar a nota fiscal da venda atual.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3">
                                    <Input
                                        placeholder="Nome / Razão Social"
                                        value={invoiceCustomer}
                                        onChange={(e) => setInvoiceCustomer(e.target.value)}
                                    />
                                    <Input
                                        placeholder="CPF/CNPJ (opcional)"
                                        value={invoiceDocument}
                                        onChange={(e) => setInvoiceDocument(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Forma de pagamento selecionada: <strong>{paymentMethod ?? 'Não selecionada'}</strong>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Total da NF-e: <strong>R$ {total.toFixed(2)}</strong>
                                    </p>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleIssueInvoice}>Confirmar emissão</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 gap-2" disabled={cart.length === 0} onClick={handleFinalizeSale}>
                            <CheckCircle2 className="w-5 h-5" /> FINALIZAR VENDA
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

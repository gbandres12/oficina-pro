"use client";

import React, { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Search,
    Plus,
    Minus,
    Trash2,
    CheckCircle2,
    CreditCard,
    Banknote,
    QrCode,
    Barcode,
    Tag,
    Calculator,
    Percent,
    DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Product {
    id: string;
    sku: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    barcode?: string;
}

interface CartItem extends Product {
    quantity: number;
}

export default function PDVPage() {
    const [products, setProducts] = useState<Product[]>([
        { id: '1', sku: 'OL-5W30-SYN', name: 'Óleo Mobil 1 5W30 Sintético 1L', price: 85.00, stock: 45, category: 'Lubrificantes', barcode: '7891234567890' },
        { id: '2', sku: 'FIL-PH5548', name: 'Filtro de Óleo Mann PH5548', price: 42.00, stock: 32, category: 'Filtros' },
        { id: '3', sku: 'PAST-DIANT', name: 'Pastilha Freio Dianteira Bosch', price: 210.00, stock: 18, category: 'Freios' },
        { id: '4', sku: 'LAMP-H7', name: 'Lâmpada H7 Osram Night Breaker', price: 65.00, stock: 24, category: 'Iluminação' },
        { id: '5', sku: 'AD-RAD-500', name: 'Aditivo Radiador Concentrado 500ml', price: 32.00, stock: 30, category: 'Arrefecimento' },
        { id: '6', sku: 'VEL-IGNI', name: 'Jogo Velas Ignição NGK', price: 145.00, stock: 15, category: 'Motor' },
        { id: '7', sku: 'BAT-60AH', name: 'Bateria Moura 60Ah', price: 520.00, stock: 8, category: 'Elétrica' },
        { id: '8', sku: 'PNEU-205-55', name: 'Pneu Michelin 205/55 R16', price: 450.00, stock: 12, category: 'Pneus' },
    ]);

    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [barcode, setBarcode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'percent' | 'value'>('percent');

    const addToCart = (product: Product) => {
        if (product.stock === 0) {
            toast.error('Produto fora de estoque');
            return;
        }

        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                toast.error('Quantidade em estoque insuficiente');
                return;
            }
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        toast.success(`${product.name} adicionado`, { duration: 1500 });
        setSearchTerm('');
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.id !== productId));
        toast.info('Item removido do carrinho');
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, Math.min(item.stock, item.quantity + delta));
                if (newQty === item.stock && delta > 0) {
                    toast.warning('Estoque máximo atingido');
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discountAmount = discountType === 'percent'
        ? (subtotal * discount / 100)
        : discount;
    const total = Math.max(0, subtotal - discountAmount);

    const handleBarcodeSearch = () => {
        const product = products.find(p => p.barcode === barcode);
        if (product) {
            addToCart(product);
            setBarcode('');
        } else {
            toast.error('Produto não encontrado');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = Array.from(new Set(products.map(p => p.category)));

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            {/* Left Panel - Products Catalog */}
            <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
                {/* Header with Search */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-4 border border-slate-200 dark:border-slate-800">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome, código ou categoria..."
                                className="pl-12 h-14 rounded-xl text-base font-medium bg-slate-50 dark:bg-slate-800 border-slate-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative w-64">
                            <Barcode className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Código de barras..."
                                className="pl-12 h-14 rounded-xl text-base font-medium bg-slate-50 dark:bg-slate-800 border-slate-200"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                            />
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <Button
                        variant={searchTerm === '' ? 'default' : 'outline'}
                        className="rounded-full font-bold text-xs px-4 h-9 whitespace-nowrap"
                        onClick={() => setSearchTerm('')}
                    >
                        Todos
                    </Button>
                    {categories.map((category) => (
                        <Button
                            key={category}
                            variant={searchTerm === category ? 'default' : 'outline'}
                            className="rounded-full font-bold text-xs px-4 h-9 whitespace-nowrap"
                            onClick={() => setSearchTerm(category)}
                        >
                            <Tag className="w-3 h-3 mr-1" />
                            {category}
                        </Button>
                    ))}
                </div>

                {/* Products Grid */}
                <ScrollArea className="flex-1">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 pb-4">
                        {filteredProducts.map(product => (
                            <Card
                                key={product.id}
                                className="group hover:shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer border-2 hover:border-primary relative overflow-hidden"
                                onClick={() => addToCart(product)}
                            >
                                <div className="absolute top-0 right-0">
                                    {product.stock < 10 && (
                                        <Badge variant="destructive" className="rounded-bl-lg rounded-tr-lg text-[10px]">
                                            Baixo Estoque
                                        </Badge>
                                    )}
                                </div>
                                <CardHeader className="p-4 pb-2">
                                    <Badge variant="secondary" className="w-fit text-[9px] uppercase tracking-wider mb-2">
                                        {product.category}
                                    </Badge>
                                    <CardTitle className="text-sm font-bold leading-tight line-clamp-2 min-h-[2.5rem]">
                                        {product.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="space-y-2">
                                        <div className="text-[10px] text-muted-foreground font-mono">
                                            SKU: {product.sku}
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="text-2xl font-black text-primary">
                                                    {new Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }).format(product.price)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-muted-foreground font-bold">ESTOQUE</div>
                                                <div className={`text-sm font-bold ${product.stock < 10 ? 'text-destructive' : 'text-green-600'}`}>
                                                    {product.stock} un
                                                </div>
                                            </div>
                                        </div>
                                        <Button className="w-full h-9 rounded-lg gap-2 group-hover:bg-primary group-hover:text-primary-foreground" variant="outline" size="sm">
                                            <Plus className="w-4 h-4" /> Adicionar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Panel - Cart & Checkout */}
            <div className="w-[450px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
                {/* Cart Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black">CARRINHO</h2>
                                <div className="text-sm opacity-90 font-semibold">
                                    {cart.length} {cart.length === 1 ? 'item' : 'itens'}
                                </div>
                            </div>
                        </div>
                        {cart.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20 rounded-xl"
                                onClick={() => setCart([])}
                            >
                                Limpar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Cart Items */}
                <ScrollArea className="flex-1 p-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 py-20 text-center">
                            <ShoppingCart className="w-16 h-16 mb-4" />
                            <p className="font-bold text-lg">Carrinho Vazio</p>
                            <p className="text-sm text-muted-foreground">Adicione produtos para iniciar a venda</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <Card key={item.id} className="shadow-md hover:shadow-lg transition-shadow border-slate-200">
                                    <CardContent className="p-4">
                                        <div className="flex gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm mb-1 line-clamp-2">{item.name}</div>
                                                <div className="text-xs text-muted-foreground font-mono mb-2">SKU: {item.sku}</div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-lg font-black text-primary">
                                                        {new Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        }).format(item.price)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">/ unidade</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end justify-between">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-md"
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <span className="font-black text-base w-8 text-center">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-md"
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <Separator className="my-3" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-muted-foreground">Subtotal:</span>
                                            <span className="text-xl font-black">
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                }).format(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Checkout Footer */}
                <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                    {/* Discount */}
                    {cart.length > 0 && (
                        <Card>
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Percent className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-bold">Desconto</span>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        className="h-9 rounded-lg"
                                        value={discount || ''}
                                        onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                                    />
                                    <Button
                                        variant={discountType === 'percent' ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-9 px-3"
                                        onClick={() => setDiscountType('percent')}
                                    >
                                        %
                                    </Button>
                                    <Button
                                        variant={discountType === 'value' ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-9 px-3"
                                        onClick={() => setDiscountType('value')}
                                    >
                                        R$
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Totals */}
                    <div className="space-y-2 bg-white dark:bg-slate-900 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium">Subtotal:</span>
                            <span className="font-bold">
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(subtotal)}
                            </span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span className="font-medium">Desconto:</span>
                                <span className="font-bold">
                                    - {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(discountAmount)}
                                </span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between items-baseline">
                            <span className="text-lg font-black">TOTAL:</span>
                            <span className="text-3xl font-black text-primary">
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(total)}
                            </span>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            variant="outline"
                            className="flex-col h-16 gap-1.5 rounded-xl hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                            disabled={cart.length === 0}
                        >
                            <Banknote className="w-5 h-5" />
                            <span className="text-[10px] font-bold">DINHEIRO</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-col h-16 gap-1.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                            disabled={cart.length === 0}
                        >
                            <CreditCard className="w-5 h-5" />
                            <span className="text-[10px] font-bold">CARTÃO</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-col h-16 gap-1.5 rounded-xl hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                            disabled={cart.length === 0}
                        >
                            <QrCode className="w-5 h-5" />
                            <span className="text-[10px] font-bold">PIX</span>
                        </Button>
                    </div>

                    {/* Finalize Sale */}
                    <Button
                        className="w-full h-14 rounded-xl text-lg font-black shadow-2xl shadow-primary/30 gap-3"
                        disabled={cart.length === 0}
                        onClick={() => {
                            toast.success('Venda finalizada com sucesso!');
                            setCart([]);
                            setDiscount(0);
                        }}
                    >
                        <CheckCircle2 className="w-6 h-6" />
                        FINALIZAR VENDA
                    </Button>
                </div>
            </div>
        </div>
    );
}

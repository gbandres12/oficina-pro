"use client";

import React, { forwardRef } from 'react';
import { ServiceOrderPrintData, CompanyInfo } from '@/lib/types/print';

interface ServiceOrderPrintProps {
    data: ServiceOrderPrintData;
    companyInfo: CompanyInfo;
}

export const ServiceOrderPrint = forwardRef<HTMLDivElement, ServiceOrderPrintProps>(
    ({ data, companyInfo }, ref) => {
        const formatCurrency = (value: number) => {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(value);
        };

        const formatDate = (date: Date | string | null) => {
            if (!date) return '-';
            const d = new Date(date);
            return d.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        };

        return (
            <div ref={ref} className="print-container bg-white p-8 text-black">
                <style jsx global>{`
                    @media print {
                        @page {
                            size: A4;
                            margin: 10mm;
                        }
                        
                        body {
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }

                        .print-container {
                            font-family: 'Courier New', 'Courier', monospace !important;
                            font-size: 9pt;
                            color: black !important;
                        }

                        .no-print {
                            display: none !important;
                        }

                        table {
                            page-break-inside: auto;
                        }

                        tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }

                        .os-header {
                            border: 2px solid black;
                            padding: 8px;
                        }

                        .os-table {
                            width: 100%;
                            border-collapse: collapse;
                            border: 1px solid black;
                        }

                        .os-table th,
                        .os-table td {
                            border: 1px solid black;
                            padding: 4px 6px;
                            text-align: left;
                        }

                        .os-table th {
                            background-color: #d3d3d3 !important;
                            font-weight: bold;
                            text-transform: uppercase;
                            font-size: 8pt;
                        }

                        .text-right {
                            text-align: right !important;
                        }

                        .text-center {
                            text-align: center !important;
                        }

                        .font-bold {
                            font-weight: bold !important;
                        }

                        .bg-gray {
                            background-color: #e0e0e0 !important;
                        }

                        .signature-box {
                            min-height: 60px;
                            border-top: 1px solid black;
                            margin-top: 40px;
                        }
                    }

                    @media screen {
                        .print-container {
                            max-width: 210mm;
                            margin: 0 auto;
                            font-family: 'Courier New', 'Courier', monospace;
                            box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        }
                    }
                `}</style>

                {/* HEADER */}
                <div className="os-header mb-4">
                    <table style={{ width: '100%', border: 'none' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '15%', verticalAlign: 'top', border: 'none', padding: '4px' }}>
                                    {companyInfo.logo ? (
                                        <img src={companyInfo.logo} alt="Logo" style={{ width: '60px', height: '60px' }} />
                                    ) : (
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            backgroundColor: '#333',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '24px'
                                        }}>
                                            {companyInfo.name.charAt(0)}
                                        </div>
                                    )}
                                </td>
                                <td style={{ width: '60%', verticalAlign: 'top', border: 'none', padding: '4px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '2px' }}>
                                        {companyInfo.name}
                                    </div>
                                    <div style={{ fontSize: '8pt' }}>
                                        <div>CNPJ: {companyInfo.cnpj}</div>
                                        <div>{companyInfo.address} - {companyInfo.city}</div>
                                        <div>FONE: {companyInfo.phone}</div>
                                        <div>EMAIL: {companyInfo.email}</div>
                                    </div>
                                </td>
                                <td style={{ width: '25%', textAlign: 'right', verticalAlign: 'top', border: 'none', padding: '4px' }}>
                                    <div style={{
                                        backgroundColor: 'black',
                                        color: 'white',
                                        padding: '8px',
                                        fontWeight: 'bold',
                                        fontSize: '18pt',
                                        textAlign: 'center',
                                        marginBottom: '4px'
                                    }}>
                                        OS
                                    </div>
                                    <div style={{ fontSize: '9pt' }}>
                                        <div>Número OS: <strong>{data.number}</strong></div>
                                        <div>Data: {formatDate(data.entryDate)}</div>
                                        <div>CNPJ: {data.client.document || '-'}</div>
                                        <div>Cidade: {companyInfo.city}</div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* CLIENT AND VEHICLE INFO */}
                <table className="os-table mb-2">
                    <tbody>
                        <tr>
                            <td style={{ width: '50%' }}>
                                <strong>Cliente:</strong> {data.client.name}
                            </td>
                            <td style={{ width: '50%' }}>
                                <strong>Endereço:</strong> {data.client.email || '-'}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <strong>CPF/CNPJ:</strong> {data.client.document || '-'}
                            </td>
                            <td>
                                <strong>Telefone:</strong> {data.client.phone}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* VEHICLE INFO */}
                <table className="os-table mb-2">
                    <tbody>
                        <tr>
                            <td style={{ width: '25%' }}>
                                <strong>Marca:</strong> {data.vehicle.brand}
                            </td>
                            <td style={{ width: '35%' }}>
                                <strong>Veículo:</strong> {data.vehicle.model}
                            </td>
                            <td style={{ width: '20%' }}>
                                <strong>Modelo:</strong> {data.vehicle.model}
                            </td>
                            <td style={{ width: '20%' }}>
                                <strong>Ano:</strong> {data.vehicle.year || '-'}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <strong>Placa:</strong> {data.vehicle.plate}
                            </td>
                            <td colSpan={3}>
                                <strong>KM:</strong> {data.km.toLocaleString('pt-BR')}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* ATTENDANT */}
                <table className="os-table mb-3">
                    <tbody>
                        <tr>
                            <td><strong>ATENDENTE:</strong> {data.mechanic}</td>
                        </tr>
                    </tbody>
                </table>

                {/* SERVICES TABLE */}
                {data.services.length > 0 && (
                    <div className="mb-3">
                        <div style={{
                            backgroundColor: '#d3d3d3',
                            padding: '4px 8px',
                            fontWeight: 'bold',
                            marginBottom: '2px'
                        }}>
                            SERVIÇO
                        </div>
                        <table className="os-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50%' }}>Descrição</th>
                                    <th className="text-center" style={{ width: '12%' }}>Und Usada</th>
                                    <th className="text-center" style={{ width: '12%' }}>Qtd</th>
                                    <th className="text-right" style={{ width: '13%' }}>Desconto</th>
                                    <th className="text-right" style={{ width: '13%' }}>Total R$</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.services.map((service, idx) => (
                                    <tr key={service.id || idx}>
                                        <td>{service.description}</td>
                                        <td className="text-center">{formatCurrency(service.price)}</td>
                                        <td className="text-center">{service.quantity.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        <td className="text-right">{formatCurrency(service.discount)}</td>
                                        <td className="text-right">{formatCurrency(service.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* PARTS TABLE */}
                {data.parts.length > 0 && (
                    <div className="mb-3">
                        <div style={{
                            backgroundColor: '#d3d3d3',
                            padding: '4px 8px',
                            fontWeight: 'bold',
                            marginBottom: '2px'
                        }}>
                            PRODUTOS
                        </div>
                        <table className="os-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50%' }}>Nome</th>
                                    <th className="text-center" style={{ width: '12%' }}>Und Usada</th>
                                    <th className="text-center" style={{ width: '12%' }}>Qtd</th>
                                    <th className="text-right" style={{ width: '13%' }}>Desconto</th>
                                    <th className="text-right" style={{ width: '13%' }}>Total R$</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.parts.map((part, idx) => (
                                    <tr key={part.id || idx}>
                                        <td>{part.name}</td>
                                        <td className="text-center">{formatCurrency(part.price)}</td>
                                        <td className="text-center">{part.quantity.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        <td className="text-right">{formatCurrency(part.discount)}</td>
                                        <td className="text-right">{formatCurrency(part.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TOTALS */}
                <table className="os-table mb-3">
                    <tbody>
                        <tr>
                            <td style={{ width: '20%' }}><strong>Sub Total</strong></td>
                            <td style={{ width: '20%' }}><strong>Sub-Serviço</strong></td>
                            <td style={{ width: '20%' }}><strong>Sub-Total</strong></td>
                            <td style={{ width: '20%' }}><strong>Desc-Peças</strong></td>
                            <td style={{ width: '20%' }}><strong>Desc.Serviço</strong></td>
                            <td style={{ width: '20%' }} className="bg-gray"><strong>Total-Geral</strong></td>
                        </tr>
                        <tr>
                            <td className="text-right">{formatCurrency(data.totals.subtotalParts)}</td>
                            <td className="text-right">{formatCurrency(data.totals.subtotalServices)}</td>
                            <td className="text-right">{formatCurrency(data.totals.totalGeneral)}</td>
                            <td className="text-right">{formatCurrency(data.totals.discountParts)}</td>
                            <td className="text-right">{formatCurrency(data.totals.discountServices)}</td>
                            <td className="text-right bg-gray"><strong>{formatCurrency(data.totals.totalFinal)}</strong></td>
                        </tr>
                    </tbody>
                </table>

                {/* FOOTER SECTIONS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ border: '1px solid black', padding: '8px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Problema Relatado:</div>
                        <div style={{ minHeight: '60px', fontSize: '9pt' }}>
                            {data.clientReport || ''}
                        </div>
                    </div>
                    <div style={{ border: '1px solid black', padding: '8px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Diagnóstico Apresentado:</div>
                        <div style={{ minHeight: '60px', fontSize: '9pt' }}>
                            {data.observations || ''}
                        </div>
                    </div>
                </div>

                {/* SIGNATURES */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '40px' }}>
                    <div>
                        <div className="signature-box" style={{ textAlign: 'center', paddingTop: '8px' }}>
                            Técnico Responsável
                        </div>
                    </div>
                    <div>
                        <div className="signature-box" style={{ textAlign: 'center', paddingTop: '8px' }}>
                            Cliente
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

ServiceOrderPrint.displayName = 'ServiceOrderPrint';

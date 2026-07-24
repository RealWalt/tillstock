'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/trpc"
import { ArrowLeft, ArrowRight, Check, CircleDollarSignIcon, ClipboardList, Coins, ImageIcon, Info, Layers, Package, PartyPopper, Store, StoreIcon, Wrench } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";
import { toast } from "sonner";

type OnboardingData = {
    name: string,
    description: string,
    ruc: string,
    phone: string
    type: 'products' | 'services' | 'mixed'
    currency: 'PYG' | 'USD' | 'ARS' | 'BRL'
    logoUrl: string | null
}

const steps = [
  { id: 1, title: 'Información del comercio', subtitle: 'Cuéntanos sobre tu negocio', icon: ClipboardList },
  { id: 2, title: 'Tipo de negocio', subtitle: 'Selecciona el tipo de actividad', icon: Store },
  { id: 3, title: 'Moneda', subtitle: 'Configura tu moneda principal', icon: Coins },
  { id: 4, title: 'Logo', subtitle: 'Sube el logo de tu negocio', icon: ImageIcon },
  { id: 5, title: '¡Listo!', subtitle: 'Todo preparado para empezar', icon: PartyPopper },
]

const businessTypes = [
    {
        value: 'products' as const,
        label: 'Productos',
        description: 'Vendés productos físicos y gestionás inventario.',
        examples: ['Tiendas de ropa', 'Supermercados', 'Ferreterías', 'Librerías y más'],
        icon: Package,
        accentColor: '#F5C518',
    },
    {
        value: 'services' as const,
        label: 'Servicios',
        description: 'Ofrecés servicios o mano de obra.',
        examples: ['Salones de belleza', 'Consultorías', 'Talleres', 'Servicios profesionales'],
        icon: Wrench,
        accentColor: '#3B82F6',
    },
    {
        value: 'mixed' as const,
        label: 'Mixto',
        description: 'Vendés productos y también ofrecés servicios.',
        examples: ['Restaurantes', 'Spa y tiendas', 'Gimnasios', 'Y muchos más'],
        icon: Layers,
        accentColor: '#A855F7',
    },
]

const currencyTypes = [
    {
        value: 'PYG' as const,
        label: 'Guaraní Paraguayo (PYG)',
        icon: 'fi fi-py'
    },
    {
        value: 'USD' as const,
        label: 'Dólar Estadounidense (USD)',
        icon: 'fi fi-us'
    },
    {
        value: 'ARS' as const,
        label: 'Peso Argentino (ARS)',
        icon: 'fi fi-ar'
    },
    {
        value: 'BRL' as const,
        label: 'Real Brasileño (BRL)',
        icon: 'fi fi-br'
    },
]

export const OnboardingWizard = () => {
    const router = useRouter();
    const { mutate, isPending } = api.business.create.useMutation({
        onSuccess: () => {
            toast.success('Negocio creado correctamente')
            router.push('/dashboard')

        },
        onError: (error) => {
            toast.error(error.message ?? 'Hubo un error')
        }
    })


    const [step, setStep] = useState(1)
    const [data, setData] = useState<OnboardingData>({
        name: '',
        description: '',
        ruc: '',
        phone: '',
        type: 'products',
        currency: 'PYG',
        logoUrl: null
    })
    

    const updateData = (fields: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...fields }))
    }

    const handleCreateBusiness = () => {
        mutate({
            name: data.name,
            type: data.type,
            currency: data.currency,
            description: data.description ?? '',
            ruc: data.ruc ?? '',
            phone: data.phone ?? '',
            logoUrl: data.logoUrl ?? ''
        })

    }

    return (
        <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-5xl flex overflow-hidden min-h-150">

                {/* Sidebar */}
                <div className="w-72 bg-[#0F1E3C] p-8 flex flex-col shrink-0">
                    <div className="flex flex-col items-center">
                        <Image src="/tillstock-logo-white.svg" alt="Tillstock" width={160} height={80} />
                        <p className="text-yellow-400 text-xs font-medium mt-6 mb-4 tracking-wide self-start">ONBOARDING</p>
                    </div>

                    <div className="space-y-1">
                        {steps.map((s) => {
                            const isActive = s.id === step
                            const isDone = s.id < step

                            return (
                                <div key={s.id} className={`flex gap-3 p-3 rounded-lg ${isActive ? 'bg-white/10' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium
                                        ${isActive ? 'bg-[#F5C518] text-[#0F1E3C]' : isDone ? 'bg-[#F5C518] text-[#0F1E3C]' : 'bg-white/10 text-white/50'}`}>
                                        {isDone ? <Check className="w-4 h-4" /> : s.id}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/60'}`}>{s.title}</p>
                                        <p className="text-xs text-white/40 mt-0.5">{s.subtitle}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Contenido dinámico */}
                <div className="flex-1 p-10 overflow-y-auto">
                    <p className="text-sm text-gray-400 text-right">Paso {step} de 5</p>

                    {step === 1 && (
                        <div className="mt-2">
                            <h2 className="text-2xl font-semibold text-gray-900">¡Bienvenido a Tillstock! 👋</h2>
                            <p className="text-gray-500 mt-1">Vamos a configurar tu comercio en unos simples pasos.</p>

                            <div className="mt-8 space-y-5 max-w-md">
                                <div className="space-y-2">
                                    <Label>Nombre del comercio</Label>
                                    <Input
                                        placeholder="Ej: Mi Tienda"
                                        value={data.name}
                                        onChange={(e) => updateData({ name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Descripción (opcional)</Label>
                                    <Textarea
                                        placeholder="Breve descripción de tu negocio"
                                        value={data.description}
                                        onChange={(e) => updateData({ description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>RUC / CI (opcional)</Label>
                                    <Input
                                        placeholder="80123456-7"
                                        value={data.ruc}
                                        onChange={(e) => updateData({ ruc: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Teléfono (opcional)</Label>
                                    <Input
                                        placeholder="+595 981 123 456"
                                        value={data.phone}
                                        onChange={(e) => updateData({ phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 max-w-md">
                                <Button
                                    className="w-full bg-[#0F1E3C] hover:bg-[#1a2e55] text-white h-11"
                                    onClick={() => setStep(2)}
                                    disabled={!data.name.trim()}
                                >
                                    Continuar
                                </Button>
                            </div>
                        </div>
                    )}

                    { step === 2 && (
                        <div key='step-2' className="mt-2 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-2xl flex items-center gap-x-2 font-semibold text-gray-900">
                                <StoreIcon className="h-7 w-7 text-yellow-400"/>
                                Tipo de Negocio
                            </h3>
                            <p className="text-muted-foreground mt-1">Selecciona la mejor opción que describe tu actividad principal.</p>

                            <div className="mt-8 grid grid-cols-3 gap-4">
                                { businessTypes.map((type) => {
                                    const Icon = type.icon
                                    const isSelected = data.type === type.value

                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => updateData({ type: type.value})}
                                            className={`relative text-left p-5 rounded-xl border-2 cursor-pointer transition-all
                                                ${isSelected ? 'border-[#F5C518] bg-[#F5C518]/5' : 'border-gray-200 hover:border-gray-300 hover:scale-105'}`}
                                        >
                                            <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center
                                                ${isSelected ? 'border-[#F5C518] bg-[#F5C518]' : 'border-gray-300'}`}>
                                                {isSelected && <div className="w-2 h-2 rounded-full bg-[#0F1E3C]" />}
                                            </div>
                                            
                                            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                                                style={{ backgroundColor: `${type.accentColor}20` }}>
                                                <Icon className="w-6 h-6" style={{ color: type.accentColor }} />
                                            </div>

                                            <p className="font-semibold text-gray-900">{type.label}</p>
                                            <p className="text-sm text-gray-500 mt-1">{type.description}</p>


                                            <p className="text-xs font-medium mt-4" style={{ color: type.accentColor }}>Ideal para:</p>
                                            <ul className="mt-2 space-y-1.5">
                                                {type.examples.map((example) => (
                                                    <li key={example} className="text-xs text-gray-600 flex items-center gap-1.5">
                                                        <Check className="w-3 h-3 shrink-0" style={{ color: type.accentColor }} />
                                                        {example}
                                                    </li>
                                                ))}
                                            </ul>
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2 items-center">
                                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700">
                                    No te preocupes, podrás cambiar esta configuración más adelante desde la configuración de tu comercio.
                                </p>
                            </div>

                            <div className="mt-8 flex items-center gap-3">
                                <Button className='flex items-center gap-2' variant='outline' onClick={() => setStep(1)}>
                                    <ArrowLeft />
                                    Volver
                                </Button>
                                <Button 
                                    className="flex-1 bg-[#0F1E3C] hover:bg-[#1a2e55] text-white h-11"
                                    onClick={() => setStep(3)}
                                    disabled={!data.type}
                                >
                                    Continuar <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    { step === 3 && (
                        <div key='step-3' className="mt-2 animate-in fade-in slide-in-from-right-4 duration-500">

                            <div className="mt-4">
                                <p className="text-xl flex items-center gap-2 font-semibold">
                                    <CircleDollarSignIcon className="h-5  w-5" />
                                    Moneda principal
                                </p>
                                <span className="text-sm text-muted-foreground">Selecciona la moneda principal que usarás principalmente en tu negocio.</span>
                            </div>

                            <div className="flex flex-col mt-2 gap-2">
                                    {currencyTypes.map((type) => {
                                        const isSelected = data.currency === type.value

                                        return (
                                        <button 
                                            key={type.value}
                                            type="button"
                                            onClick={() => updateData({ currency: type.value})}
                                            className={`relative py-8 text-left p-5 rounded-xl border-2 cursor-pointer transition-all
                                                ${isSelected ? 'border-[#F5C518] bg-[#F5C518]/5' : 'border-gray-200 hover:border-gray-300 hover:scale-105'}`}
                                            >
                                            <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center
                                                ${isSelected ? 'border-[#F5C518] bg-[#F5C518]' : 'border-gray-300'}`}>
                                                {isSelected && <div className="w-2 h-2 rounded-full bg-[#0F1E3C]" />}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className={`${type.icon}`}></span>
                                                <div>
                                                    <p className="font-semibold">{type.label}</p> 
                                                </div>
                                            </div>
                                        </button>
                                        )
                                    })}
                            </div>

                            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2 items-center">
                                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700">
                                    No te preocupes, podrás cambiar esta configuración más adelante desde la configuración de tu comercio.
                                </p>
                            </div>

                            <div className="mt-8 flex items-center gap-3">
                                <Button className='flex items-center gap-2' variant='outline' onClick={() => setStep(1)}>
                                    <ArrowLeft />
                                    Volver
                                </Button>
                                <Button 
                                    className="flex-1 bg-[#0F1E3C] hover:bg-[#1a2e55] text-white h-11"
                                    onClick={() => setStep(4)}
                                    disabled={!data.type}
                                >
                                    Continuar <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div key="step-4" className="mt-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-2xl font-semibold text-gray-900">Logo de tu negocio</h2>
                            <p className="text-gray-500 mt-1">Podés agregarlo ahora o más tarde desde configuración.</p>

                            <div className="mt-8 max-w-md">
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
                                    <ImageIcon className="w-10 h-10 text-gray-300 mx-auto" />
                                    <p className="text-sm text-gray-500 mt-3">Esta función estará disponible próximamente</p>
                                    <p className="text-xs text-gray-400 mt-1">Podrás subir tu logo desde Configuración cuando la función este disponible</p>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <Button variant="outline" onClick={() => setStep(3)}>
                                    <ArrowLeft className="w-4 h-4" /> Volver
                                </Button>
                                <Button 
                                    className="flex-1 bg-[#0F1E3C] hover:bg-[#1a2e55] text-white h-11"
                                    onClick={() => setStep(5)}
                                >
                                    Continuar <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div key="step-5" className="mt-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-2xl font-semibold text-gray-900">¡Todo listo! 🎉</h2>
                            <p className="text-gray-500 mt-1">Revisá la información antes de crear tu comercio.</p>

                            <div className="mt-8 max-w-md bg-gray-50 rounded-xl p-5 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Nombre</span>
                                    <span className="font-medium text-gray-900">{data.name}</span>
                                </div>
                                {data.description && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Descripción</span>
                                        <span className="font-medium text-gray-900 text-right max-w-50">{data.description}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tipo</span>
                                    <span className="font-medium text-gray-900">
                                        {businessTypes.find(t => t.value === data.type)?.label}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Moneda</span>
                                    <span className="font-medium text-gray-900">
                                        {currencyTypes.find(c => c.value === data.currency)?.label}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 max-w-md">
                                <Button variant="outline" onClick={() => setStep(4)}>
                                    <ArrowLeft className="w-4 h-4" /> Volver
                                </Button>
                                <Button 
                                    className="flex-1 bg-[#0F1E3C] hover:bg-[#1a2e55] text-white h-11"
                                    onClick={handleCreateBusiness}
                                    disabled={isPending}
                                >
                                    {isPending ? 'Creando...' : 'Crear mi comercio'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { useNavigate } from 'react-router-dom';
import { useEstablishment } from '@/contexts/EstablishmentContext';

interface OnboardingTourProps {
    onComplete?: () => void;
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
    const [run, setRun] = useState(false);
    const navigate = useNavigate();
    const { tenantId } = useEstablishment();

    useEffect(() => {
        // Use tenant-specific key so each new account sees the tour
        const tourKey = tenantId ? `hasSeenTour_${tenantId}` : 'hasSeenTour';
        const hasSeenTour = localStorage.getItem(tourKey);

        console.log('[OnboardingTour] Checking tour status:', { tenantId, tourKey, hasSeenTour });

        if (!hasSeenTour && tenantId) {
            console.log('[OnboardingTour] Starting tour for new tenant!');
            // Aguardar um pouco para a página carregar
            setTimeout(() => setRun(true), 1500);
        }
    }, [tenantId]);

    const steps: Step[] = [
        {
            target: 'body',
            content: (
                <div className="space-y-4 text-left p-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">🚀</span>
                        <h2 className="text-2xl font-black text-slate-950">Seu negócio decola aqui!</h2>
                    </div>
                    <p className="text-slate-900 text-lg leading-relaxed font-medium">
                        Eu vou te levar em uma viagem rápida por cada canto do sistema. Aperte em continuar e segure firme!
                    </p>
                    <div className="flex items-center gap-2 text-primary font-black bg-primary/10 p-3 rounded-xl w-fit border border-primary/20">
                        <span>⏱️</span>
                        <span className="text-sm uppercase tracking-tight">Leitura: menos de 2 min</span>
                    </div>
                </div>
            ),
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '[data-tour="dashboard"]',
            content: (
                <div className="space-y-3 text-left">
                    <h3 className="font-black text-xl text-slate-950">📊 Painel Geral</h3>
                    <p className="text-slate-900 font-medium">Aqui você vê o dinheiro entrando e os agendamentos do dia.</p>
                    <p className="text-blue-600 font-bold text-sm animate-pulse">👉 Clique em Continuar e eu te levo na Oficina de Configuração!</p>
                </div>
            ),
            placement: 'right',
        },
        {
            target: '[data-tour="settings"]',
            content: (
                <div className="space-y-3 text-left">
                    <h3 className="font-black text-xl text-slate-950">⚙️ Configurações (Sua Identidade)</h3>
                    <p className="text-slate-950 font-medium font-bold text-lg">Parece mágica! ✨</p>
                    <p className="text-slate-900">Ao clicar, o sistema vai te abrir a tela onde você troca cores, logo e coloca seu PIX.</p>
                </div>
            ),
            placement: 'right',
        },
        {
            target: 'body',
            content: (
                <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🎨</span>
                        <h3 className="font-black text-xl text-slate-950">Seja o arquiteto!</h3>
                    </div>
                    <p className="text-slate-900 font-medium">Veja como é fácil deixar sua loja com a sua cara. Cada pixel aqui conta para o seu cliente!</p>
                </div>
            ),
            placement: 'center',
        },
        {
            target: '[data-tour="services"]',
            content: (
                <div className="space-y-3 text-left">
                    <h3 className="font-black text-xl text-slate-950">✂️ Seus Talentos</h3>
                    <p className="text-slate-950 font-bold">Aperte em continuar para criarmos o seu cardápio de serviços!</p>
                </div>
            ),
            placement: 'right',
        },
        {
            target: 'body',
            content: (
                <div className="space-y-3 text-left text-primary">
                    <h3 className="font-black text-xl">📝 Menu de Serviços</h3>
                    <p className="text-slate-900 font-medium">Você cria, define o tempo e o preço. É aqui que você brilha!</p>
                </div>
            ),
            placement: 'center',
        },
        {
            target: '[data-tour="professionals"]',
            content: (
                <div className="space-y-3 text-left">
                    <h3 className="font-black text-xl text-slate-950">👥 Seus Parceiros</h3>
                    <p className="text-slate-950 font-medium">Quem vai te ajudar a crescer? Vamos ver a tela de equipe!</p>
                </div>
            ),
            placement: 'right',
        },
        {
            target: 'body',
            content: (
                <div className="space-y-3 text-left">
                    <h3 className="font-black text-xl text-slate-950">👔 Gestão de Talentos</h3>
                    <p className="text-slate-900 font-medium italic">"Sozinho vamos rápido, juntos vamos longe."</p>
                    <p className="text-slate-900">Cadastre a galera e vincule aos serviços!</p>
                </div>
            ),
            placement: 'center',
        },
        {
            target: '[data-tour="agenda"]',
            content: (
                <div className="space-y-3 text-left">
                    <h3 className="font-black text-xl text-slate-950">📅 Agenda Blindada</h3>
                    <p className="text-slate-950 font-medium">O controle do seu tempo é o seu maior bem!</p>
                </div>
            ),
            placement: 'right',
        },
        {
            target: 'body',
            content: (
                <div className="space-y-3 text-left">
                    <h3 className="font-black text-xl text-slate-950">🕒 Horários em Tempo Real</h3>
                    <p className="text-slate-900 font-medium text-lg">Tudo organizadinho!</p>
                    <p className="text-slate-900">Ninguém mais vai se perder com horários marcados.</p>
                </div>
            ),
            placement: 'center',
        },
        {
            target: '[data-tour="payments"]',
            content: (
                <div className="space-y-3 text-left">
                    <h3 className="font-black text-xl text-slate-950">💰 Dinheiro no Bolso</h3>
                    <p className="text-slate-950 font-bold">Bora conferir os Pix?</p>
                </div>
            ),
            placement: 'right-end', // Alinhado para abrir pra cima se não couber
        },
        {
            target: 'body',
            content: (
                <div className="space-y-3 text-left">
                    <h3 className="font-black text-xl text-slate-950">✅ Confirmação de Vendas</h3>
                    <p className="text-slate-950 font-bold leading-tight">
                        Validou o comprovante? Agenda confirmada! Dinheiro seguro.
                    </p>
                </div>
            ),
            placement: 'center',
        },
        {
            target: '[data-tour="client-link"]',
            content: (
                <div className="space-y-4 text-left">
                    <h3 className="font-black text-xl text-slate-950">🔗 Seu Canhão de Vendas</h3>
                    <p className="text-slate-950 font-medium">Seu link oficial. Coloque no Instagram e veja a mágica!</p>
                </div>
            ),
            placement: 'right-end', // Alinhado para não fugir da tela
        },
        {
            target: 'body',
            content: (
                <div className="space-y-6 text-left p-2">
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-black text-slate-950">Fim do Tour! 🏁</h2>
                        <p className="text-slate-700 text-xl font-bold italic">Você está no topo.</p>
                    </div>

                    <div className="bg-slate-950 text-white p-6 rounded-3xl shadow-2xl space-y-4 border-2 border-primary/30">
                        <p className="font-black text-2xl text-primary border-b border-white/10 pb-2 flex items-center gap-2">
                            📈 Próximos Passos:
                        </p>
                        <ul className="space-y-4 text-base font-bold">
                            <li className="flex items-start gap-4 transform hover:translate-x-1 transition-all">
                                <span className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-lg">1</span>
                                <span>Defina sua **Chave PIX** agora</span>
                            </li>
                            <li className="flex items-start gap-4 transform hover:translate-x-1 transition-all">
                                <span className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-lg">2</span>
                                <span>Cadastre seu melhor **Serviço**</span>
                            </li>
                            <li className="flex items-start gap-4 transform hover:translate-x-1 transition-all">
                                <span className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-lg">3</span>
                                <span>Pegue seu **Link** e poste no Whats!</span>
                            </li>
                        </ul>
                    </div>
                </div>
            ),
            placement: 'center',
        },
    ];

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, type, index } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        // Lógica de navegação automática e lúdica
        if (type === 'step:after') {
            // Mapeamento: ao passar deste passo (index), leve para a rota
            const navigationMap: Record<number, string> = {
                2: '/admin/settings',      // Após apontar para "Configurações" na sidebar
                4: '/admin/services',      // Após apontar para "Serviços" na sidebar
                6: '/admin/professionals', // Após apontar para "Profissionais" na sidebar
                8: '/admin/agenda',        // Após apontar para "Agenda" na sidebar
                10: '/admin/payments',      // Após apontar para "Pagamentos" na sidebar
                12: '/admin'                // Volta para o início (Dashboard) no final
            };

            if (navigationMap[index]) {
                navigate(navigationMap[index]);
            }
        }

        if (finishedStatuses.includes(status)) {
            setRun(false);
            const tourKey = tenantId ? `hasSeenTour_${tenantId}` : 'hasSeenTour';
            localStorage.setItem(tourKey, 'true');
            console.log('[OnboardingTour] Tour completed, saved:', tourKey);
            if (onComplete) {
                onComplete();
            }
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showProgress
            showSkipButton
            scrollOffset={100}
            disableScrolling={false}
            disableScrollParentFix={false}
            floaterProps={{
                hideArrow: false,
                disableFlip: false, // Permite que o balão vire pra cima se não couber embaixo
                offset: 15,
            }}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    primaryColor: '#8B5CF6',
                    zIndex: 10000,
                    backgroundColor: '#ffffff',
                    arrowColor: '#ffffff',
                    textColor: '#000000',
                },
                tooltip: {
                    borderRadius: 24, // Reduzi levemente para caber melhor em telas menores
                    padding: 25,      // Reduzi levemente o respiro para ganhar espaço vertical
                    boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.5)',
                    border: '2px solid #e2e8f0',
                    maxHeight: '90vh', // Garante que o balão não ultrapasse a altura da tela
                    overflowY: 'auto',  // Permite scroll dentro do balão se o texto for muito longo
                },
                tooltipContainer: {
                    textAlign: 'left'
                },
                buttonNext: {
                    backgroundColor: '#8B5CF6',
                    borderRadius: 12,
                    padding: '12px 24px',
                    fontWeight: '900',
                    fontSize: '15px',
                    boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)',
                },
                buttonBack: {
                    color: '#8B5CF6',
                    marginRight: 10,
                    fontWeight: '900',
                    fontSize: '15px'
                },
                buttonSkip: {
                    color: '#64748b',
                    fontWeight: '800'
                },
            }}
            locale={{
                back: 'Anterior',
                close: 'Sair',
                last: 'BORA COMEÇAR! 🚀',
                next: 'Continuar',
                skip: 'Ver depois',
            }}
        />
    );
}

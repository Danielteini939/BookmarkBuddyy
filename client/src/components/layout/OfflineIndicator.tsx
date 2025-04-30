import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { isOffline, setupConnectivityListeners } from '@/lib/serviceWorkerRegistration';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function OfflineIndicator() {
  // Estado para controlar se o app está offline
  const [offline, setOffline] = useState(isOffline());
  // Estado para controlar se o alerta foi fechado pelo usuário
  const [dismissed, setDismissed] = useState(false);
  // Contador para indicar há quanto tempo está offline
  const [offlineTime, setOfflineTime] = useState(0);

  useEffect(() => {
    // Configura listeners para eventos de online/offline
    const cleanup = setupConnectivityListeners(
      // Callback quando fica online
      () => {
        setOffline(false);
        setDismissed(false);
        setOfflineTime(0);
      },
      // Callback quando fica offline
      () => {
        setOffline(true);
        setDismissed(false);
        setOfflineTime(0);
      }
    );

    // Timer para incrementar o contador de tempo offline
    let timer: number | undefined;
    if (offline) {
      timer = window.setInterval(() => {
        setOfflineTime(prev => prev + 1);
      }, 60000); // Incrementa a cada minuto
    }

    // Limpar event listeners e timer quando o componente for desmontado
    return () => {
      cleanup();
      if (timer) clearInterval(timer);
    };
  }, [offline]);

  // Se não estiver offline ou o alerta foi dispensado, não mostrar nada
  if (!offline || dismissed) {
    return null;
  }

  // Formatar mensagem de tempo offline
  const formatOfflineTime = () => {
    if (offlineTime < 1) return 'agora';
    if (offlineTime === 1) return 'há 1 minuto';
    return `há ${offlineTime} minutos`;
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Alert variant="destructive" className="relative bg-yellow-50 border-yellow-200 text-yellow-700">
        <WifiOff className="h-4 w-4 mr-2" />
        <div className="flex-1">
          <AlertTitle className="text-yellow-800">Modo Offline</AlertTitle>
          <AlertDescription className="text-yellow-700">
            <p className="mb-2">Você está operando sem conexão {formatOfflineTime()}.</p>
            <p className="text-sm">Suas alterações serão sincronizadas quando sua conexão for restabelecida.</p>
          </AlertDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute top-2 right-2 h-6 w-6 rounded-full p-0 border-yellow-300"
          onClick={() => setDismissed(true)}
        >
          ✕
        </Button>
      </Alert>
    </div>
  );
}
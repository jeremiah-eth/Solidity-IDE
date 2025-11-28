import React, { useState, useEffect } from 'react';
import { checkLocalNodeConnection } from '../utils/localNode';
import { Wifi, WifiOff } from 'lucide-react';

export const LocalNodeStatus: React.FC = () => {
    const [isOnline, setIsOnline] = useState<boolean>(false);

    useEffect(() => {
        const checkStatus = async () => {
            const status = await checkLocalNodeConnection();
            setIsOnline(status);
        };

        checkStatus();
        const interval = setInterval(checkStatus, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, []);

    if (!isOnline) {
        return (
            <div className="flex items-center space-x-1 px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs border border-red-900/50" title="Local node disconnected">
                <WifiOff size={12} />
                <span className="hidden sm:inline">Localhost Offline</span>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-1 px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs border border-green-900/50" title="Local node connected">
            <Wifi size={12} />
            <span className="hidden sm:inline">Localhost Online</span>
        </div>
    );
};

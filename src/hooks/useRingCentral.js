import {
    useCallback,
    useState
} from "react";
import {
    ringCentralService
} from "../services/ringCentral";
export function useRingCentral() {
    const [
        connected,
        setConnected
    ] = useState(false);
    const [
        activeCall,
        setActiveCall
    ] = useState(null);
    const [
        error,
        setError
    ] = useState(null);
    const checkConnection =
        useCallback(async () => {
            try {
                setError(null);
                await ringCentralService.getStatus();
                setConnected(true);
            } catch (error) {
                console.error(error);
                setConnected(false);
                setError(
                    error.message
                );
            }
        }, []);
    const getActiveCall =
        useCallback(async () => {
            try {
                const response =
                    await ringCentralService
                        .getActiveCall();
                setActiveCall(response);
                return response;
            } catch (error) {
                console.error(error);
                setError(
                    error.message
                );
            }
        }, []);
    return {
        connected,
        activeCall,
        error,
        checkConnection,
        getActiveCall
    };
}
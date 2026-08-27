import {
    useCallback,
    useEffect,
    useState
} from "react";
import {
    CALL_STATUS
} from "../utils/constants";
export function useCall() {
    const [
        status,
        setStatus
    ] = useState(CALL_STATUS.IDLE);
    const [
        duration,
        setDuration
    ] = useState(0);
    const [
        caller,
        setCaller
    ] = useState(null);
    useEffect(() => {
        if (status !== CALL_STATUS.ACTIVE) {
            return;
        }
        const timer =
            setInterval(() => {
                setDuration(
                    previous => previous + 1
                );
            }, 1000);
        return () => {
            clearInterval(timer);
        };
    }, [status]);
    const receiveCall = useCallback((callerData) => {
        setCaller(callerData);
        setDuration(0);
        setStatus(
            CALL_STATUS.RINGING
        );
    }, []);
    const acceptCall = useCallback(() => {
        setStatus(
            CALL_STATUS.ACTIVE
        );
    }, []);
    const rejectCall = useCallback(() => {
        setStatus(
            CALL_STATUS.ENDED
        );
    }, []);
    const endCall = useCallback(() => {
        setStatus(
            CALL_STATUS.ENDED
        );
    }, []);
    const resetCall = useCallback(() => {
        setStatus(
            CALL_STATUS.IDLE
        );
        setDuration(0);
        setCaller(null);
    }, []);
    return {
        status,
        duration,
        caller,
        receiveCall,
        acceptCall,
        rejectCall,
        endCall,
        resetCall
    };
}
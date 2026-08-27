import { useCallback, useEffect, useState } from "react";
import zohoCRM from "../services/zohoCRM";

export function useZohoCRM() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEmbedded, setIsEmbedded] = useState(false);

    const loadCurrentUser = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await zohoCRM.getCurrentUser();
            setUser(response);
            setIsEmbedded(zohoCRM.isEmbedded());
            return response;
        } catch (err) {
            console.error("[useZohoCRM] Load user error:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        zohoCRM
            .getCurrentUser()
            .then((response) => {
                if (isMounted) {
                    setUser(response);
                    setIsEmbedded(zohoCRM.isEmbedded());
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.warn("[useZohoCRM] Init user notice:", err);
                    setError(err);
                    setIsEmbedded(zohoCRM.isEmbedded());
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const createLead = useCallback(async (leadData, options) => {
        return await zohoCRM.createLead(leadData, options);
    }, []);

    return {
        user,
        loading,
        error,
        isEmbedded,
        loadCurrentUser,
        createLead
    };
}

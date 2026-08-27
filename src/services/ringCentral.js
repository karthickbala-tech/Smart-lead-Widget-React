const API_URL =
    import.meta.env.VITE_API_URL ||
    "";
export const ringCentralService = {
    async getStatus() {
        try {
            const response =
                await fetch(
                    `${API_URL}/ringcentral/status`
                );
            if (!response.ok) {
                throw new Error(
                    "RingCentral server unavailable"
                );
            }
            return await response.json();
        } catch (error) {
            console.error(
                "RingCentral status error:",
                error
            );
            throw error;
        }
    },
    async getActiveCall() {
        try {
            const response =
                await fetch(
                    `${API_URL}/ringcentral/active-call`
                );
            if (!response.ok) {
                throw new Error(
                    "Unable to get active call"
                );
            }
            return await response.json();
        } catch (error) {
            console.error(
                "Active call error:",
                error
            );
            throw error;
        }
    }
};
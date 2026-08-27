const api = {
    async get(url) {
        console.log(
            "Mock GET:",
            url
        );
        return {
            success: true,
            data: null
        };
    },
    async post(url, data) {
        console.log(
            "Mock POST:",
            url,
            data
        );
        return {
            success: true,
            data
        };
    }
};
export default api;
import axios from "axios";
import toast from "react-hot-toast";

export const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true
})

api.interceptors.response.use(
    (response) => {
        return response
    },
    async(error) => {
        const config = error.config;
        if (error?.response?.status == 401 && error?.response.data.message == "Token expired" && !config._retry){
            config._retry = true
            console.log("Retrying......")
            try{
                const res = await api.post("/refreshToken");
                console.log("Token Refreshed!");

                const newAccessToken = res.data;
                config.headers.Authorization = `Bearer ${newAccessToken}`

                return api(config)
            }catch(err){
                toast.error("Session expired. Please log in again.");

                setTimeout(() => {
                    window.location.href = "/";
                }, 1500);
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
)
import axios, { type AxiosError, type AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { router } from "../../App/Router/Router";

const baseURL = import.meta.env.VITE_API_URL;
const agent = axios.create({
    baseURL,
});

agent.interceptors.response.use(
    response => {
        return response;
    },
    (error: AxiosError) => {
        if (!error.response) {
            toast.error("Network Error: Cannot connect to API. Please make sure the backend is running and you have accepted the HTTPS certificate at https://localhost:7223 in your browser.");
            return Promise.reject(error);
        }

        const { data, status, config } = error.response as AxiosResponse;

        switch (status) {
            case 400:
                if (config?.method === 'get' && data?.errors && Object.prototype.hasOwnProperty.call(data.errors, 'id')) {
                    router.navigate('/not-found');
                    break;
                }
                if (data?.errors) {
                    const modelStateErrors: string[] = [];
                    for (const key in data.errors) {
                        if (data.errors[key]) {
                            modelStateErrors.push(data.errors[key]);
                        }
                    }
                    throw modelStateErrors.flat();
                } else if (typeof data === 'string') {
                    toast.error(data);
                } else {
                    toast.error(data?.title || data?.message || "Bad Request");
                }
                break;

            case 401:
                toast.error("Unauthorised");
                break;

            case 404:
                router.navigate('/not-found');
                break;

            case 500:
                try {
                    sessionStorage.setItem('lastServerError', JSON.stringify(data));
                } catch {
                    // Ignore storage exceptions if private browsing / quota exceeded
                }
                router.navigate('/server-error', { state: { error: data } });
                break;

            default:
                break;
        }

        return Promise.reject(error);
    }
);

export default agent;
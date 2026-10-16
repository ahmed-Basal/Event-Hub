import axios, { type AxiosError, type AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { router } from "../../App/Router/Router";
import { config } from "../../config";

const agent = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
});

agent.interceptors.request.use(reqConfig => {
    if (!reqConfig.baseURL) {
        reqConfig.baseURL = config.apiUrl;
    }
    const userJson = localStorage.getItem(config.storage.userKey);
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            if (user?.token) {
                reqConfig.headers.Authorization = `Bearer ${user.token}`;
            }
        } catch {
            // ignore JSON parse error
        }
    }
    return reqConfig;
});

export const sleep = (delay: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    });
};

agent.interceptors.response.use(
    async response => {
        if (import.meta.env.DEV) {
           // await sleep(100000);
        }
        return response;
    },
    (error: AxiosError) => {
        if (!error.response) {
            toast.error("Network Error: Cannot connect to API. Please make sure the backend is running.");
            return Promise.reject(error);
        }

        const { data, status, config } = error.response as AxiosResponse;

        switch (status) {
            case 400: {
                // Bad GUID or specific route id error on GET -> navigate to not-found
                if (config?.method?.toLowerCase() === 'get' && data?.errors && Object.prototype.hasOwnProperty.call(data.errors, 'id')) {
                    if (router?.navigate) {
                        router.navigate('/not-found');
                    } else {
                        window.location.href = '/not-found';
                    }
                    break;
                }

                // Standard Validation Errors (RFC 7807 ValidationProblemDetails or array of errors)
                if (data?.errors) {
                    const modelStateErrors: string[] = [];
                    if (Array.isArray(data.errors)) {
                        modelStateErrors.push(...data.errors);
                    } else if (typeof data.errors === 'object') {
                        for (const key in data.errors) {
                            if (data.errors[key]) {
                                if (Array.isArray(data.errors[key])) {
                                    modelStateErrors.push(...data.errors[key]);
                                } else {
                                    modelStateErrors.push(String(data.errors[key]));
                                }
                            }
                        }
                    }
                    if (modelStateErrors.length > 0) {
                        throw modelStateErrors;
                    }
                }

                if (typeof data === 'string') {
                    toast.error(data);
                } else {
                    toast.error(data?.message || data?.title || data?.detail || "Bad Request");
                }
                break;
            }

            case 401: {
                const isAuthCheck = config?.url?.endsWith('/account') || config?.url === '/account';
                if (!isAuthCheck) {
                    toast.error(data?.message || "Unauthorized: Please sign in to continue.");
                }
                break;
            }

            case 403: {
                toast.error(data?.message || "Forbidden: You do not have permission to perform this action.");
                break;
            }

            case 404: {
                const method = config?.method?.toLowerCase();
                const isQuery = !method || method === 'get';
                if (isQuery) {
                    if (router?.navigate) {
                        router.navigate('/not-found');
                    } else {
                        window.location.href = '/not-found';
                    }
                } else {
                    toast.error(data?.message || "The requested resource was not found.");
                }
                break;
            }

            case 500: {
                const method = config?.method?.toLowerCase();
                const isMutation = method && ['post', 'put', 'delete', 'patch'].includes(method);

                if (isMutation) {
                    const traceSuffix = data?.traceId ? ` (Trace ID: ${data.traceId})` : '';
                    toast.error(`Server Error: ${data?.message || 'Operation failed'}${traceSuffix}`);
                    break;
                }

                // On data fetching queries (GET), navigate to diagnostic ServerError page
                try {
                    sessionStorage.setItem('lastServerError', JSON.stringify(data));
                } catch {
                    // Ignore storage exceptions if private browsing / quota exceeded
                }
                if (router?.navigate) {
                    router.navigate('/server-error', { state: { error: data } });
                } else {
                    window.location.href = '/server-error';
                }
                break;
            }

            default:
                break;
        }

        return Promise.reject(error);
    }
);

export default agent;
import axios from "axios";



const baseURL = import.meta.env.VITE_API_URL;
const agent = axios.create({
    baseURL,
});

agent.interceptors.response.use(async response => {
    try {
       
        return response;
    } catch (error) {
        console.log(error);
        return Promise.reject(error);
    }
});

export default agent;
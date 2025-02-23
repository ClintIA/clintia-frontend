import axios from 'axios';
import Cookies from 'js-cookie';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response.status === 401) {
            Cookies.remove('token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);
export default apiClient;
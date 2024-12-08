import axios from 'axios';
import Cookies from 'js-cookie';

export const apiClient = axios.create({
    baseURL: 'https://api.clinica.com.br/api/v1',
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
            window.location.href = '/login/admin';
        }
        return Promise.reject(error);
    }
);
export default apiClient;
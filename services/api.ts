import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9092/bft-webapi';

export interface JsonRpcRequest {
    jsonrpc: '2.0';
    method: string;
    params: any;
    id: number | string;
}

export interface JsonRpcResponse<T> {
    jsonrpc: '2.0';
    result?: T;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
    id: number | string;
}

let idCounter = 1;

export const rpcClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to inject token if available
rpcClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = token;
        config.headers['token'] = token;
    }
    return config;
});

export const callRpc = async <T>(method: string, params: any = {}): Promise<T> => {
    const id = idCounter++;
    const payload: JsonRpcRequest = {
        jsonrpc: '2.0',
        method,
        params,
        id,
    };

    try {
        const response = await rpcClient.post<JsonRpcResponse<T>>('', payload);
        if (response.data.error) {
            throw new Error(response.data.error.message);
        }
        return response.data.result as T;
    } catch (error: any) {
        console.error(`RPC Error [${method}]:`, error);
        throw error;
    }
};

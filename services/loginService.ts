
import { callRpc } from './api';

export interface VerifyTicketParams {
    sceneId: string;
    certifyId: string;
    deviceToken?: string;
    data?: string;
}

export interface LoginParams {
    account: string;
    password?: string;
    code?: string;
    uuid?: string; // From VerifyTicket
    loginType: 'email' | 'mobile';
    phoneDistrict?: string;
}

export interface LoginResult {
    accessToken: string;
    account: any;
    isNew: boolean;
}

export const loginService = {
    /**
     * Verifies the Aliyun CAPTCHA ticket.
     * Returns a UUID to be used in the login request.
     */
    verifyTicket: async (params: VerifyTicketParams): Promise<string> => {
        // The backend expects specific field names, ensure they match
        return callRpc<string>('login.VerifyTicket', params);
    },

    /**
     * Signs in the user.
     */
    signIn: async (params: LoginParams): Promise<LoginResult> => {
        // Map frontend params to backend API expectations
        const apiParams = {
            Account: params.account,
            Password: params.password,
            Code: params.code,
            UUID: params.uuid,
            LoginType: 'web', // Default to web
            PhoneDistrict: params.phoneDistrict,
            AccountType: params.loginType === 'email' ? '2' : '1' // 1: Phone, 2: Email (Assuming enum values)
        };
        return callRpc<LoginResult>('login.SignIn', apiParams);
    }
};

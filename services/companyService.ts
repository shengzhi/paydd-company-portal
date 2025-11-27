import { callRpc } from './api';
import { Shareholder } from '../types';

export const companyService = {
    addShareholder: (data: Partial<Shareholder>) => {
        // Mapping frontend Shareholder to backend AddCompanyMemberReq
        const payload = {
            member_type: 'Shareholder',
            first_name: data.name?.split(' ')[0] || '',
            last_name: data.name?.split(' ').slice(1).join(' ') || '',
            email: data.email,
            phone_number: data.mobile,
            entity_type: data.entityType === 'Individual' ? '1' : '2', // Assumption
            cert_no: data.idNumber,
            cert_type: data.idType,
            nationality: data.country,
        };
        return callRpc<{ member_id: string }>('company.AddCompanyMember', payload);
    },

    getShareholders: () => {
        return callRpc<{ list: any[]; total: number }>('company.GetCompanyMemberList', {}).then(res => {
            // Map backend response to frontend Shareholder interface
            return {
                list: res.list.map((item: any) => ({
                    id: item.member_id,
                    name: `${item.first_name} ${item.last_name}`,
                    email: item.email,
                    mobile: item.phone_number,
                    country: item.nationality,
                    entityType: item.entity_type === '1' ? 'Individual' : 'Corporate',
                    personType: 'Shareholder',
                    idNumber: item.cert_no,
                    idType: item.cert_type,
                })) as Shareholder[],
                total: res.total
            };
        });
    },
};

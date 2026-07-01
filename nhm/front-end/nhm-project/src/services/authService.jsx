import api from "@/lib/axios";

export const authService = {
    signUp: async (data) => {
        const res = await api.post('/auth/signup', data, {withCredentials:true});
    return res.data;
    },

    signIn: async (data) => {
        const res = await api.post('/auth/signin', data, {withCredentials:true});
        return res.data;
    },
    signOut: async () => {
        const res = await api.post('auth/signout', {}, {withCredentials: true});
        return res.data;
    }
};
import api from "@/lib/axios";

export const authService = {
    signUp: async ({username,password}
    ) => {
        const res = await api.post('/auth/signup', {username,password}, {withCredentials:true});
    return res.data;
    },

    signIn: async (data
    ) => {
        const res = await api.post('/auth/signin', data, {withCredentials:true});
        return res.data;
    }
};
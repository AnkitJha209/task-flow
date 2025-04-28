import axios from "axios";
import CredentialsProvider from "next-auth/providers/credentials";
export const authOptions = {
    pages: {
        signIn: "/auth/signin",
    },
    providers: [
        CredentialsProvider({
            name: "Email",
            credentials: {
                username: {
                    label: "email",
                    type: "text",
                    placeholder: "Email",
                },
                password: {
                    label: "password",
                    type: "password",
                    placeholder: "Password",
                },
            },
            async authorize(credentials: any, req) {
                const email = credentials.email;
                const password = credentials.password;
                const res = await axios.post(
                    "http://localhost:8000/api/v1/auth/signin",
                    {
                        email: email,
                        password: password,
                    }
                );
                const user = res.data;
                console.log(user);
                if (user) {
                    console.log(user)
                    return user;
                } else {
                    return null;
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET || "",
};

import CredentialsProvider from "next-auth/providers/credentials";
export const authOptions = {
        providers: [
            CredentialsProvider({
                name: "Email",
                credentials: {
                    username: {label: 'email', type:'text', placeholder: 'Email'},
                    password: {label: 'password', type: 'password', placeholder: "Password"}
                },
                async authorize(credentials: any, req) {
                    const email = credentials.email;
                    const password = credentials.password;
                    // const user = await prisma.user.findOne({
                    //     where: {
                    //         email,
                    //         password
                    //     }
                    // })
                    return {
                        id: "user1"
                    }
                },
            })
        ],
        secret: process.env.NEXTAUTH_SECRET
}
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const data = await response.json()

          if (data.success && data.data) {
            return {
              id: data.data._id,
              email: data.data.user.email,
              name: data.data.user.name,
              role: data.data.role,
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
              avatar: data.data.user.avatar?.url || "",
            }
          }
          return null
        } catch (error) {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.role = user.role
        token.avatar = user.avatar
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub!
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.user.role = token.role as string
      session.user.avatar = token.avatar as string
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
}

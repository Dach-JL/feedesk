import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@feedesk.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Simple hardcoded auth for initial development.
        // Once the DB is fully wired up, we can switch to querying Prisma for Users.
        if (credentials?.email === "admin@feedesk.com" && credentials?.password === "admin") {
          return { id: "1", name: "System Admin", email: "admin@feedesk.com" }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error
        session.user.id = token.id as string
      }
      return session
    }
  }
})

export { handler as GET, handler as POST }

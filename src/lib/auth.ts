import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Type augmentations to include role and studentId in the session and JWT
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "student";
      studentId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "admin" | "student";
    studentId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "student";
    studentId?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@feedesk.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 1. Admin Login Path (Hardcoded)
        if (credentials.email === "admin@feedesk.com" && credentials.password === "admin") {
          return { 
            id: "admin-1", 
            name: "System Admin", 
            email: "admin@feedesk.com",
            role: "admin"
          };
        }

        // 2. Student Login Path (Database + bcrypt)
        try {
          const student = await prisma.student.findUnique({
            where: { email: credentials.email },
          });

          // If no student, or no password set for student
          if (!student || !student.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, student.password);

          if (isPasswordValid) {
            return {
              id: `student-${student.id}`,
              name: student.name,
              email: student.email,
              role: "student",
              studentId: student.id, // Keep raw student ID for API scoping
            };
          }
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.studentId = user.studentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        if (token.studentId) {
          session.user.studentId = token.studentId;
        }
      }
      return session;
    }
  }
};

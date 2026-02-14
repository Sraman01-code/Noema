"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole, CartItem } from "./types";

type AuthContextType = {
  user: User | null;
  hydrated: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;

  register: (
    email: string,
    password: string,
    role: UserRole
  ) => Promise<{ success: boolean; message?: string }>;

  logout: () => void;

  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  checkout: () => { success: boolean; message?: string };
  deposit: (amount: number) => void;

  loginAs: (role: UserRole) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const TEMP_EMAIL_DOMAINS = [
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
];

type StoredUser = User & { password: string };

const hashPassword = (password: string) =>
  btoa(password.split("").reverse().join(""));

const verifyPassword = (password: string, hash: string) =>
  hashPassword(password) === hash;

const getUsersDB = (): Record<string, StoredUser> =>
  JSON.parse(localStorage.getItem("users_db") || "{}");

const saveUsersDB = (db: Record<string, StoredUser>) =>
  localStorage.setItem("users_db", JSON.stringify(db));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("auth_user");
    if (saved) setUser(JSON.parse(saved));
    setHydrated(true);
  }, []);

  const persistSession = (u: User) => {
    setUser(u);
    localStorage.setItem("auth_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  const register = async (
    email: string,
    password: string,
    role: UserRole
  ) => {
    const domain = email.split("@")[1];
    if (TEMP_EMAIL_DOMAINS.includes(domain)) {
      return { success: false, message: "Disposable emails are not allowed." };
    }

    const db = getUsersDB();
    if (db[email]) {
      return { success: false, message: "Email already registered." };
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name: email.split("@")[0],
      email,
      role,
      balance: role === "seller" ? 20 : 25,
      cart: [],
      isGuest: false,
    };

    db[email] = {
      ...newUser,
      password: hashPassword(password),
    };

    saveUsersDB(db);
    persistSession(newUser);

    return { success: true };
  };

  const login = async (email: string, password: string) => {
    const db = getUsersDB();
    const record = db[email];

    if (!record) {
      return { success: false, message: "Email not found." };
    }

    if (!verifyPassword(password, record.password)) {
      return { success: false, message: "Incorrect password." };
    }

    const { password: _, ...safeUser } = record;

    persistSession({
      ...safeUser,
      isGuest: false,
    });

    return { success: true };
  };

  const addToCart = (item: CartItem) => {
    if (!user) return;

    const existing = user.cart.find(
      (i) => i.productId === item.productId
    );

    const updatedCart = existing
      ? user.cart.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      : [...user.cart, item];

    persistSession({ ...user, cart: updatedCart });
  };

  const removeFromCart = (productId: string) => {
    if (!user) return;
    persistSession({
      ...user,
      cart: user.cart.filter((i) => i.productId !== productId),
    });
  };

  const checkout = () => {
    if (!user) return { success: false, message: "Not logged in." };

    if (user.isGuest) {
      return {
        success: false,
        message: "Please create an account to complete checkout.",
      };
    }

    const total = user.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (user.balance < total) {
      return { success: false, message: "Insufficient balance." };
    }

    persistSession({
      ...user,
      balance: user.balance - total,
      cart: [],
    });

    return { success: true, message: "Checkout successful!" };
  };

  const deposit = (amount: number) => {
    if (!user || amount <= 0) return;
    persistSession({ ...user, balance: user.balance + amount });
  };

  const loginAs = async (role: UserRole) => {
    const guestUser: User = {
      id: crypto.randomUUID(),
      name: `${role}_guest`,
      email: `${role}_guest_${crypto.randomUUID()}@demo.com`,
      role,
      balance: role === "seller" ? 20 : 25,
      cart: [],
      isGuest: true,
    };

    persistSession(guestUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        hydrated,
        login,
        register,
        logout,
        addToCart,
        removeFromCart,
        checkout,
        deposit,
        loginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

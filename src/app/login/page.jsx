"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        try {
            setError("");
            setLoading(true);
            await login(data.email, data.password);
            router.push("/");
        } catch (err) {
            setError("Failed to log in: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-[#e0d5c2] bg-white p-8 shadow-sm dark:border-[#3c3347] dark:bg-[#211d27]">
                <div>
                    <h2 className="text-center text-3xl font-bold tracking-tight text-[#2b2116] dark:text-[#f6ede0]">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-[#5d5245] dark:text-[#d7ccbe]">
                        Or{" "}
                        <Link
                            href="/signup"
                            className="font-medium text-[#d69a44] hover:text-[#c4852c] dark:text-[#f2c66f]"
                        >
                            create a new account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium leading-6 text-[#2b2116] dark:text-[#f6ede0]"
                            >
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    {...register("email", { required: true })}
                                    className="block w-full rounded-md border-0 py-1.5 text-[#2b2116] shadow-sm ring-1 ring-inset ring-[#e0d5c2] placeholder:text-[#8a7a67] focus:ring-2 focus:ring-inset focus:ring-[#d69a44] sm:text-sm sm:leading-6 dark:bg-[#292331] dark:text-[#f6ede0] dark:ring-[#3c3347] dark:focus:ring-[#f2c66f]"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium leading-6 text-[#2b2116] dark:text-[#f6ede0]"
                            >
                                Password
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    {...register("password", { required: true })}
                                    className="block w-full rounded-md border-0 py-1.5 text-[#2b2116] shadow-sm ring-1 ring-inset ring-[#e0d5c2] placeholder:text-[#8a7a67] focus:ring-2 focus:ring-inset focus:ring-[#d69a44] sm:text-sm sm:leading-6 dark:bg-[#292331] dark:text-[#f6ede0] dark:ring-[#3c3347] dark:focus:ring-[#f2c66f]"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-md bg-[#d69a44] px-3 py-2 text-sm font-semibold text-[#2b1a09] shadow-sm hover:bg-[#c4852c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d69a44] disabled:opacity-50 dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#e4b857]"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

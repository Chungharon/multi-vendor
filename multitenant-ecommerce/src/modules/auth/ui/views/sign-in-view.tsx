"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Poppins } from "next/font/google"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { loginSchema } from "@/modules/auth/schemas";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import z from "zod";


const poppins = Poppins({
    subsets: ["latin"],
    weight: ["700"],
});


export const SignInView = () => {

    const router = useRouter();


    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const login = useMutation(trpc.auth.login.mutationOptions({
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries(trpc.auth.session.queryFilter());
            router.push("/");
        },
    }));
    

    const form = useForm<z.infer<typeof loginSchema>>({
        mode: "all",
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },                                                 
    });

    const onSubmit = (values: z.infer<typeof loginSchema>) => {
        login.mutate(values);
        // Handle form submission logic here

    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="bg-[#F4F4F0] h-screen w-full lg:col-span-3 overflow-y-auto">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-8 p-4 lg:p-16"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <Link href={"/"}>
                            <span className={cn("text-2xl font-semibold", poppins.className)}>
                                funrade
                            </span>
                            </Link>
                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="text-base border-none underline"
                                >
                                <Link prefetch href="/sign-up">
                                    Sign Up
                                </Link>
                            </Button>
                        </div>
                        <h1 className="text-4xl font-medium">
                            Welcome back to funrade.
                        </h1>
                        <FormField
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel
                                        className="text-base"
                                    >
                                        Email
                                    </FormLabel>
                                    <FormControl>
                                        <Input { ...field } placeholder="email"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel
                                        className="text-base"
                                    >
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input { ...field }  placeholder="paswword" type="password" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            disabled={login.isPending}
                            type="submit"
                            size="lg"
                            variant="default"
                            className="bg-black text-white hover:bg-pink-400 hover:text-primary"

                        >
                            Log in
                        </Button>
                    </form>
                </Form>
            </div>
            <div 
             className="h-screen w-full lg:col-span-2 hidden lg:block"
             style={{ 
                backgroundImage: "url('/auth-bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center"
             }}
            >
            </div>
        </div>
    )
}
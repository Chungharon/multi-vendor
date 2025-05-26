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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { registerSchema } from "@/modules/auth/schemas";
import { z } from "zod";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["700"],
});


export const SignUpView = () => {

    const router = useRouter();

    const trpc = useTRPC();
    const register = useMutation(trpc.auth.register.mutationOptions({
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: () => {
            router.push("/")
        }
    }));
    

    const form = useForm<z.infer<typeof registerSchema>>({
        mode: "all",
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            username: "",
        },                                                 
    });

    const onSubmit = (values: z.infer<typeof registerSchema>) => {
        register.mutate(values);
        // Handle form submission logic here

    };

    const username = form.watch("username");
    const usernameErrors = form.formState.errors.username;

    const showPreview = username && !usernameErrors;

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
                                <Link prefetch href="/sign-in">
                                    Sign in
                                </Link>
                            </Button>
                        </div>
                        <h1 className="text-4xl font-medium">
                            Join over 1,000+ users and start your journey with funrade.
                        </h1>
                        <FormField
                            name="username"
                            render={({ field}) => (
                                <FormItem>
                                    <FormLabel
                                        className="text-base"
                                    >
                                        Username
                                    </FormLabel>
                                    <FormControl>
                                        <Input { ...field } placeholder="store domain" />
                                    </FormControl>
                                    <FormDescription
                                        className={cn("hidden", showPreview && "block")}
                                    >
                                        Your store will be available at{" "};
                                        {/* TODO: Use proper method to generate preview url */}
                                        <strong>
                                            {username}
                                        </strong>.shop.com
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                        <Input { ...field }  placeholder="pasword" type="password" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            disabled={register.isPending}
                            type="submit"
                            size="lg"
                            variant="default"
                            className="bg-black text-white hover:bg-pink-400 hover:text-primary"

                        >
                            Create account
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
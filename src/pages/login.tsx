import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Leaf, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { TOKEN_KEYS, ROLES } from '@/lib/constants';

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleLogin = async (data: LoginForm) => {
    try {
      const response = await login.mutateAsync(data);
      // Role check — must be admin or super_admin
      if (response.data.user.role !== ROLES.ADMIN && response.data.user.role !== ROLES.SUPER_ADMIN) {
        localStorage.removeItem(TOKEN_KEYS.ACCESS);
        localStorage.removeItem(TOKEN_KEYS.REFRESH);
        localStorage.removeItem(TOKEN_KEYS.USER);
        toast.error('Access denied. Admin portal is for administrators only.');
        return;
      }
      navigate({ to: '/' });
    } catch (err: unknown) {
      const apiMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      const message = apiMsg ?? (err instanceof Error ? err.message : 'Login failed');
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <Leaf className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold">Finecity Landscape</CardTitle>
          <CardDescription>Sign in to the admin portal</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@finecity.ae" type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={login.isPending}>
                {login.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

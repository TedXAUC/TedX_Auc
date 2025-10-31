import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      toast.error("Please enter your full name.");
      return;
    }
    setIsSubmitting(true);
   try {
  // RESTORE THE OPTIONS BLOCK TO SEND FULL NAME
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { // <-- ADD THIS OBJECT
      data: {
        full_name: fullName, // <-- Send the full name here
      },
    },
  });

      if (error) throw error;

      // The full name will be stored in the public.profiles table by a trigger
      // You may need to manually update the public.profiles table in Supabase
      // for the new user after signup to set the initial full_name.
      toast.success("Registration successful! Please check your email to confirm your account.");
       // Redirect to home page after sign up
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen pt-24">
      <div className="mx-auto max-w-md w-full card-glow p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text">Create an Account</h1>
          <p className="text-muted-foreground">
            Join TEDxAUC to book events and manage your profile.
          </p>
        </div>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your Name"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full hero-button" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

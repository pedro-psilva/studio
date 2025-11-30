'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';

export default function RegisterPage() {
  const [accountType, setAccountType] = useState('pf');

  return (
    <>
      <CardHeader className="p-0 mb-6 text-center">
        <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
        <CardDescription>
          Join Itlab to streamline your digital dentistry workflow.
        </CardDescription>
      </CardHeader>
      <form>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Account Type</Label>
            <RadioGroup
              defaultValue="pf"
              className="grid grid-cols-2 gap-4"
              onValueChange={setAccountType}
            >
              <div>
                <RadioGroupItem value="pf" id="pf" className="peer sr-only" />
                <Label
                  htmlFor="pf"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Individual (PF)
                </Label>
              </div>
              <div>
                <RadioGroupItem value="pj" id="pj" className="peer sr-only" />
                <Label
                  htmlFor="pj"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Company (PJ)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {accountType === 'pj' && (
            <div className="grid gap-2">
              <Label htmlFor="clinic-name">Clinic Name</Label>
              <Input id="clinic-name" placeholder="Doe Dental Clinic" />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input id="full-name" placeholder="Dr. John Doe" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
            Create an account
          </Button>
        </div>
      </form>
      <div className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link href="/auth/login" className="underline">
          Sign in
        </Link>
      </div>
    </>
  );
}

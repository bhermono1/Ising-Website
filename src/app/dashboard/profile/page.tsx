import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });
  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-foreground">Profile</h1>
      <Card className="p-6">
        <p className="mb-5 text-sm text-muted-foreground">
          Email: <span className="text-foreground">{user.email}</span> (cannot be changed)
        </p>
        <ProfileForm defaultValues={{ name: user.name ?? "", phone: user.phone ?? "" }} />
      </Card>
    </div>
  );
}

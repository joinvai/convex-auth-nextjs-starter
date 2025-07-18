import { SecurityTest } from "@/components/auth/security-test";

export default function TestSecurityPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Security Measures Test</h1>
                    <p className="text-muted-foreground mt-2">
                        Test and monitor the security measures implemented for the authentication system.
                    </p>
                </div>

                <SecurityTest />
            </div>
        </div>
    );
}
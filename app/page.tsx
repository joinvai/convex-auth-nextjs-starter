
import { AuthTest } from "@/components/auth-test";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">ShipOrSkip</h1>
      <p className="mb-6">Welcome to the application!</p>
      <AuthTest />
    </div>
  );
}

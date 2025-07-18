"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Clock, Ban, Activity, AlertTriangle, CheckCircle } from "lucide-react";

export function SecurityTest() {
    const [testEmail, setTestEmail] = useState("test@example.com");
    const [testResults, setTestResults] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Queries for security data
    const rateLimitStats = useQuery(api.rateLimiting.getRateLimitStats, { email: testEmail });
    const securityStats = useQuery(api.securityAudit.getSecurityStats, { timeWindow: 24 * 60 * 60 * 1000 });
    const tokenSecurityStats = useQuery(api.tokenSecurity.getTokenSecurityStats, { timeWindow: 24 * 60 * 60 * 1000 });

    // Mutations for testing
    const recordMagicLinkRequest = useMutation(api.rateLimiting.recordMagicLinkRequest);
    const cleanupRateLimit = useMutation(api.rateLimiting.cleanupRateLimitEntries);
    const cleanupSecurity = useMutation(api.securityAudit.cleanupSecurityLogs);
    const cleanupTokens = useMutation(api.tokenSecurity.cleanupTokenSecurity);

    const runSecurityTest = async (testType: string) => {
        setIsLoading(true);
        try {
            let result;

            switch (testType) {
                case "rate-limit":
                    // Test rate limiting by making multiple requests
                    const requests = [];
                    for (let i = 0; i < 5; i++) {
                        try {
                            const request = await recordMagicLinkRequest({
                                email: testEmail,
                                ipAddress: "127.0.0.1",
                                userAgent: "SecurityTest/1.0",
                            });
                            requests.push({ attempt: i + 1, success: true, result: request });
                        } catch (error) {
                            requests.push({
                                attempt: i + 1,
                                success: false,
                                error: error instanceof Error ? error.message : "Unknown error"
                            });
                        }
                    }
                    result = { testType: "Rate Limiting", requests };
                    break;

                case "cleanup":
                    // Test cleanup functions
                    const rateLimitCleanup = await cleanupRateLimit();
                    const securityCleanup = await cleanupSecurity({ retentionDays: 1 });
                    const tokenCleanup = await cleanupTokens();

                    result = {
                        testType: "Security Cleanup",
                        rateLimitCleanup,
                        securityCleanup,
                        tokenCleanup,
                    };
                    break;

                default:
                    result = { error: "Unknown test type" };
            }

            setTestResults(prev => ({
                ...prev,
                [testType]: {
                    timestamp: new Date().toISOString(),
                    result,
                },
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                [testType]: {
                    timestamp: new Date().toISOString(),
                    error: error instanceof Error ? error.message : "Unknown error",
                },
            }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security Measures Test Dashboard
                    </CardTitle>
                    <CardDescription>
                        Test and monitor the security measures implemented for authentication
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="test-email">Test Email</Label>
                            <Input
                                id="test-email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="Enter email for testing"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={() => runSecurityTest("rate-limit")}
                                disabled={isLoading}
                                variant="outline"
                            >
                                Test Rate Limiting
                            </Button>
                            <Button
                                onClick={() => runSecurityTest("cleanup")}
                                disabled={isLoading}
                                variant="outline"
                            >
                                Test Cleanup Functions
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="stats" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="stats">Security Statistics</TabsTrigger>
                    <TabsTrigger value="rate-limit">Rate Limiting</TabsTrigger>
                    <TabsTrigger value="tokens">Token Security</TabsTrigger>
                    <TabsTrigger value="tests">Test Results</TabsTrigger>
                </TabsList>

                <TabsContent value="stats" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {securityStats && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Security Events (24h)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Total Events</span>
                                            <Badge variant="outline">{securityStats.totalEvents}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Successful</span>
                                            <Badge variant="default">{securityStats.successfulEvents}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Failed</span>
                                            <Badge variant="destructive">{securityStats.failedEvents}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Unique Users</span>
                                            <Badge variant="secondary">{securityStats.uniqueUsers}</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {tokenSecurityStats && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        Token Security (24h)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Total Tokens</span>
                                            <Badge variant="outline">{tokenSecurityStats.totalTokens}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Used Tokens</span>
                                            <Badge variant="default">{tokenSecurityStats.usedTokens}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Expired</span>
                                            <Badge variant="secondary">{tokenSecurityStats.expiredTokens}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Blacklisted</span>
                                            <Badge variant="destructive">{tokenSecurityStats.blacklistedTokens}</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Security Features
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="default">✓</Badge>
                                        <span className="text-sm">Rate Limiting</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="default">✓</Badge>
                                        <span className="text-sm">Token Security</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="default">✓</Badge>
                                        <span className="text-sm">Session Cleanup</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="default">✓</Badge>
                                        <span className="text-sm">Security Audit</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="rate-limit" className="space-y-4">
                    {rateLimitStats && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Rate Limiting Status for {testEmail}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Request Count</Label>
                                            <div className="text-2xl font-bold">
                                                {rateLimitStats.requestCount} / {rateLimitStats.maxRequests}
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Status</Label>
                                            <div className="flex items-center gap-2">
                                                {rateLimitStats.isLimited ? (
                                                    <Badge variant="destructive">Rate Limited</Badge>
                                                ) : (
                                                    <Badge variant="default">Available</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {rateLimitStats.isLimited && rateLimitStats.remainingTime > 0 && (
                                        <Alert>
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>
                                                Rate limit active. Next request allowed in {Math.ceil(rateLimitStats.remainingTime / 60000)} minutes.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {rateLimitStats.entries && rateLimitStats.entries.length > 0 && (
                                        <div>
                                            <Label>Recent Requests</Label>
                                            <div className="space-y-2 mt-2">
                                                {rateLimitStats.entries.map((entry, index) => (
                                                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                                        <span className="text-sm">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                                                        <Badge variant="outline">{entry.type}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="tokens" className="space-y-4">
                    {tokenSecurityStats && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Ban className="h-5 w-5" />
                                    Token Security Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Magic Link Expiry</Label>
                                        <div className="text-sm text-muted-foreground">
                                            {tokenSecurityStats.config.MAGIC_LINK_EXPIRY / 60000} minutes
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Max Token Attempts</Label>
                                        <div className="text-sm text-muted-foreground">
                                            {tokenSecurityStats.config.MAX_TOKEN_ATTEMPTS}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Average Attempts</Label>
                                        <div className="text-sm text-muted-foreground">
                                            {tokenSecurityStats.averageAttempts.toFixed(2)}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Blacklist Retention</Label>
                                        <div className="text-sm text-muted-foreground">
                                            {tokenSecurityStats.config.BLACKLIST_RETENTION / (60 * 60 * 1000)} hours
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="tests" className="space-y-4">
                    {Object.entries(testResults).map(([testType, result]) => (
                        <Card key={testType}>
                            <CardHeader>
                                <CardTitle>Test: {testType}</CardTitle>
                                <CardDescription>
                                    Executed at {result.timestamp}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    ))}

                    {Object.keys(testResults).length === 0 && (
                        <Card>
                            <CardContent className="text-center py-8">
                                <p className="text-muted-foreground">No test results yet. Run some tests to see results here.</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
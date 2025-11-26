import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function TestFunctions() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const [activeTest, setActiveTest] = useState(null);

    const runTest = async (functionName) => {
        setActiveTest(functionName);
        setLoading(true);
        setResult(null);
        setError(null);
        
        try {
            const response = await base44.functions.invoke(functionName, {});
            setResult(response.data);
        } catch (err) {
            setError(err.message || 'Failed to connect');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Test Backend Functions</h1>
                
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>OpenAI Connection</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button onClick={() => runTest('testOpenai')} disabled={loading}>
                                {loading && activeTest === 'testOpenai' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Test OpenAI
                            </Button>
                            
                            {activeTest === 'testOpenai' && result && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-700 mb-2">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">Success!</span>
                                    </div>
                                    <p className="text-gray-700">{result.message}</p>
                                    <p className="text-sm text-gray-500 mt-2">Model: {result.model}</p>
                                </div>
                            )}
                            
                            {activeTest === 'testOpenai' && error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <XCircle className="w-5 h-5" />
                                        <span className="font-medium">Error: {error}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Stripe Connection</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button onClick={() => runTest('testStripe')} disabled={loading}>
                                {loading && activeTest === 'testStripe' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Test Stripe
                            </Button>
                            
                            {activeTest === 'testStripe' && result && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-700 mb-2">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">Success!</span>
                                    </div>
                                    <p className="text-gray-700">{result.message}</p>
                                    <p className="text-sm text-gray-500 mt-2">Account: {result.account_id}</p>
                                    <p className="text-sm text-gray-500">Currency: {result.default_currency?.toUpperCase()}</p>
                                </div>
                            )}
                            
                            {activeTest === 'testStripe' && error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <XCircle className="w-5 h-5" />
                                        <span className="font-medium">Error: {error}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Twilio Connection</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button onClick={() => runTest('testTwilio')} disabled={loading}>
                                {loading && activeTest === 'testTwilio' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Test Twilio
                            </Button>
                            
                            {activeTest === 'testTwilio' && result && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-700 mb-2">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">Success!</span>
                                    </div>
                                    <p className="text-gray-700">{result.message}</p>
                                    <p className="text-sm text-gray-500 mt-2">Account: {result.account_name}</p>
                                    <p className="text-sm text-gray-500">Status: {result.status}</p>
                                </div>
                            )}
                            
                            {activeTest === 'testTwilio' && error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <XCircle className="w-5 h-5" />
                                        <span className="font-medium">Error: {error}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
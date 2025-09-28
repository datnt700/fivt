import { redirect } from 'next/navigation';
import { auth } from "@/auth";
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, CreditCard, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';

const HomePage = async () => {
    const session = await auth();
    if (!session || !session.user) {
        return redirect('/auth/login');
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">Welcome to Fivt</h1>
                        <p className="text-xl text-muted-foreground">
                            Your intelligent financial companion for better money management
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center space-x-2">
                                    <MessageSquare className="h-5 w-5 text-blue-500" />
                                    <CardTitle className="text-lg">AI Assistant</CardTitle>
                                </div>
                                <CardDescription>
                                    Get personalized financial advice and strategies
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/chatbot">
                                    <Button className="w-full">
                                        Start Chat
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center space-x-2">
                                    <CreditCard className="h-5 w-5 text-green-500" />
                                    <CardTitle className="text-lg">Banking</CardTitle>
                                </div>
                                <CardDescription>
                                    Connect your bank account for transaction insights
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/banking">
                                    <Button variant="outline" className="w-full">
                                        Connect Bank
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="h-5 w-5 text-purple-500" />
                                    <CardTitle className="text-lg">Analytics</CardTitle>
                                </div>
                                <CardDescription>
                                    View your financial trends and insights
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full" disabled>
                                    Coming Soon
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Features Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Features</CardTitle>
                            <CardDescription>
                                Discover what makes Fivt your perfect financial companion
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4">
                                    <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">AI-Powered Advice</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Get personalized financial recommendations powered by advanced AI
                                    </p>
                                </div>
                                <div className="text-center p-4">
                                    <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your financial data is encrypted and protected with industry-standard security
                                    </p>
                                </div>
                                <div className="text-center p-4">
                                    <CreditCard className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Bank Integration</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Connect your bank accounts securely to get real-time financial insights
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default HomePage;
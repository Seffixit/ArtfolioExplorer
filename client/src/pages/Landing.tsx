import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FolderLock, Shield, Users, Database, ArrowRight } from "lucide-react";

export default function Landing() {
  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center">
                <FolderLock className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Secure Business
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                File Storage
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Enterprise-grade file storage with credential-based access control. 
              Secure your business documents with granular permissions and comprehensive audit trails.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={handleSignIn} className="text-lg px-8">
                Access Storage
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose SecureVault?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Professional file storage solution designed for businesses that prioritize security and control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-8 border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardContent>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Enterprise Security</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Bank-level encryption, secure authentication, and comprehensive access controls 
                ensure your sensitive business files remain protected.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-8 border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardContent>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Granular Permissions</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Control exactly who can access, view, or modify files with role-based permissions. 
                Grant and revoke access instantly as your team changes.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-8 border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardContent>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Database className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Complete Audit Trail</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track every file access, upload, and modification with detailed logs. 
                Meet compliance requirements with comprehensive activity monitoring.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 dark:bg-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Secure Your Files?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Join businesses worldwide who trust SecureVault with their critical documents.
            </p>
            <Button size="lg" onClick={handleSignIn} className="text-lg px-8">
              Sign In to Continue
            </Button>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-2">Stay Informed</h2>
          <p className="text-lg mb-6 opacity-90">
            Get security updates and best practices for business file management
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <Input 
              type="email" 
              placeholder="Enter your business email" 
              className="flex-1 bg-white text-gray-900 placeholder:text-gray-500"
            />
            <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

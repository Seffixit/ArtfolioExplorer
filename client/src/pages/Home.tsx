import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useThemeContext } from "@/components/ThemeProvider";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { FolderLock, Moon, Sun, LogOut, Plus, Folder, Upload, Users, Settings, Search, File, Shield } from "lucide-react";
import type { BucketWithDetails, FileWithDetails } from "@shared/schema";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme } = useThemeContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  // State for file storage
  const [selectedBucket, setSelectedBucket] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateBucket, setShowCreateBucket] = useState(false);
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [bucketName, setBucketName] = useState("");
  const [bucketDescription, setBucketDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // Fetch buckets
  const { 
    data: buckets = [], 
    isLoading: bucketsLoading, 
    error: bucketsError 
  } = useQuery<BucketWithDetails[]>({
    queryKey: ['/api/buckets'],
    retry: false,
  });

  // Fetch files for selected bucket
  const { 
    data: files = [], 
    isLoading: filesLoading, 
    error: filesError 
  } = useQuery<FileWithDetails[]>({
    queryKey: ['/api/files', { bucketId: selectedBucket, search: searchQuery }],
    enabled: !!selectedBucket,
    retry: false,
  });

  // Create bucket mutation
  const createBucketMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; isPublic: boolean }) => {
      return await apiRequest('POST', '/api/buckets', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buckets'] });
      setShowCreateBucket(false);
      setBucketName("");
      setBucketDescription("");
      setIsPublic(false);
      toast({
        title: "Success",
        description: "Bucket created successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create bucket",
        variant: "destructive",
      });
    },
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      setShowUploadFile(false);
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const handleCreateBucket = () => {
    if (!bucketName.trim()) return;
    createBucketMutation.mutate({
      name: bucketName,
      description: bucketDescription,
      isPublic,
    });
  };

  const handleFileUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedBucket) return;
    
    const formData = new FormData(event.currentTarget);
    formData.append('bucketId', selectedBucket.toString());
    
    uploadFileMutation.mutate(formData);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderLock className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                  <FolderLock className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">SecureVault</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hover:bg-accent"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>

              <div className="flex items-center space-x-3">
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="hover:bg-accent"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Buckets */}
        <div className="w-80 border-r bg-muted/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Storage Buckets</h2>
            <Dialog open={showCreateBucket} onOpenChange={setShowCreateBucket}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Bucket
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Bucket</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bucket-name">Bucket Name</Label>
                    <Input
                      id="bucket-name"
                      value={bucketName}
                      onChange={(e) => setBucketName(e.target.value)}
                      placeholder="Enter bucket name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bucket-description">Description</Label>
                    <Textarea
                      id="bucket-description"
                      value={bucketDescription}
                      onChange={(e) => setBucketDescription(e.target.value)}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is-public"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="is-public">Make bucket public</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateBucket(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateBucket}
                      disabled={createBucketMutation.isPending || !bucketName.trim()}
                    >
                      {createBucketMutation.isPending ? "Creating..." : "Create Bucket"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {bucketsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : bucketsError ? (
            <div className="text-center text-muted-foreground">
              <p>Failed to load buckets</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/buckets'] })}
              >
                Retry
              </Button>
            </div>
          ) : buckets.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No buckets found</p>
              <p className="text-sm">Create your first bucket to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {buckets.map((bucket) => (
                <Card 
                  key={bucket.id}
                  className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
                    selectedBucket === bucket.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedBucket(bucket.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {bucket.isPublic ? (
                        <Folder className="w-5 h-5 text-primary" />
                      ) : (
                        <Shield className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{bucket.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {bucket.files?.length || 0} files
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Main Content - Files */}
        <div className="flex-1 p-6">
          {selectedBucket ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {buckets.find(b => b.id === selectedBucket)?.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {buckets.find(b => b.id === selectedBucket)?.description}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Dialog open={showUploadFile} onOpenChange={setShowUploadFile}>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload File</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleFileUpload} className="space-y-4">
                        <div>
                          <Label htmlFor="file">Select File</Label>
                          <Input
                            id="file"
                            name="file"
                            type="file"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="file-description">Description</Label>
                          <Textarea
                            id="file-description"
                            name="description"
                            placeholder="Optional file description"
                          />
                        </div>
                        <div>
                          <Label htmlFor="file-tags">Tags</Label>
                          <Input
                            id="file-tags"
                            name="tags"
                            placeholder="Comma-separated tags"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setShowUploadFile(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={uploadFileMutation.isPending}>
                            {uploadFileMutation.isPending ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {filesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-1" />
                      <Skeleton className="h-3 w-1/4" />
                    </Card>
                  ))}
                </div>
              ) : filesError ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-destructive mb-4">Failed to load files</p>
                    <Button 
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/files'] })}
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : files.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <File className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No files found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? 
                        "No files match your search criteria" : 
                        "Upload your first file to get started"
                      }
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => setShowUploadFile(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <Card key={file.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <File className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{file.originalName}</h3>
                          <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                          <p className="text-xs text-muted-foreground">{file.mimeType}</p>
                          {file.description && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {file.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Uploaded by {file.uploader.firstName} {file.uploader.lastName}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FolderLock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a bucket</h3>
                <p className="text-muted-foreground">
                  Choose a storage bucket from the sidebar to view and manage files
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

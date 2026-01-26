import { useCourseMaterials } from '@/hooks/useCourseMaterials';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Download,
  FileText,
  FileArchive,
  File,
  FolderOpen,
} from 'lucide-react';

interface CourseMaterialsDownloadProps {
  courseId: string;
  courseName?: string;
}

export const CourseMaterialsDownload = ({ courseId, courseName }: CourseMaterialsDownloadProps) => {
  const { materials, isLoading } = useCourseMaterials(courseId);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type === 'pdf') return <FileText className="w-5 h-5 text-red-400" />;
    if (['zip', 'rar', '7z'].includes(type)) return <FileArchive className="w-5 h-5 text-yellow-400" />;
    return <File className="w-5 h-5 text-blue-400" />;
  };

  const handleDownload = (url: string, filename: string) => {
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="w-5 h-5 text-primary" />
            자료실
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!materials || materials.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="w-5 h-5 text-primary" />
            자료실
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">아직 등록된 자료가 없습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FolderOpen className="w-5 h-5 text-primary" />
          자료실
          <Badge variant="secondary" className="ml-2">
            {materials.length}개
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {materials.map((material) => (
            <div
              key={material.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
            >
              {/* File Icon */}
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0 border border-border">
                {getFileIcon(material.file_type)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{material.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {material.file_type?.toUpperCase()}
                  </Badge>
                  {material.file_size && (
                    <span>{formatFileSize(material.file_size)}</span>
                  )}
                </div>
                {material.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {material.description}
                  </p>
                )}
              </div>

              {/* Download Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDownload(material.file_url, material.title)}
                className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

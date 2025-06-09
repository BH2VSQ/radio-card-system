import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const NotFoundPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">页面未找到</h1>
        <p className="text-muted-foreground mt-1">
          您访问的页面不存在
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>页面未找到</CardTitle>
          <CardDescription>
            功能开发中...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">此页面正在开发中，敬请期待。</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;

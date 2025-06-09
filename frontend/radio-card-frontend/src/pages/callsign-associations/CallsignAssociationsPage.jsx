import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CallsignAssociationsPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">呼号关联</h1>
        <p className="text-muted-foreground mt-1">
          管理呼号关联关系
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>呼号关联</CardTitle>
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

export default CallsignAssociationsPage;

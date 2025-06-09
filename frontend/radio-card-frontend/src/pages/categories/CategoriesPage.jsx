import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CategoriesPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">分类管理</h1>
        <p className="text-muted-foreground mt-1">
          管理卡片分类
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>分类管理</CardTitle>
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

export default CategoriesPage;

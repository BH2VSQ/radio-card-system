import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SentCardsPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">发出的卡片</h1>
        <p className="text-muted-foreground mt-1">
          管理您发出的QSL卡片
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>发出的卡片列表</CardTitle>
          <CardDescription>
            这里将显示您发出的所有QSL卡片
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">功能开发中...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentCardsPage;


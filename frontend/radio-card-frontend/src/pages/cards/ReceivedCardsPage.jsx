import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ReceivedCardsPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">收到的卡片</h1>
        <p className="text-muted-foreground mt-1">
          管理您收到的QSL卡片
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>收到的卡片列表</CardTitle>
          <CardDescription>
            这里将显示您收到的所有QSL卡片
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">功能开发中...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceivedCardsPage;


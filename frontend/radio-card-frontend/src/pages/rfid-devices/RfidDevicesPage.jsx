import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RfidDevicesPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">RFID设备</h1>
        <p className="text-muted-foreground mt-1">
          管理RFID读写设备
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>RFID设备</CardTitle>
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

export default RfidDevicesPage;

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  CreditCard, 
  QrCode, 
  Radio, 
  TrendingUp,
  Calendar,
  MapPin,
  Users
} from 'lucide-react';

const DashboardPage = () => {
  const [stats] = useState({
    totalCards: 156,
    receivedCards: 89,
    sentCards: 67,
    eyeballCards: 23,
    thisMonthCards: 12,
    activeDevices: 3,
    categories: 8,
    associations: 15
  });

  const recentCards = [
    {
      id: '1',
      callsign: 'JA1ABC',
      name: '田中太郎',
      date: '2025-06-08',
      frequency: '14.205 MHz',
      mode: 'SSB',
      type: 'received',
      contactType: 'shortwave'
    },
    {
      id: '2',
      callsign: 'VK2DEF',
      name: 'John Smith',
      date: '2025-06-07',
      frequency: '21.300 MHz',
      mode: 'CW',
      type: 'sent',
      contactType: 'shortwave'
    },
    {
      id: '3',
      callsign: 'BH1GHI',
      name: '李明',
      date: '2025-06-06',
      frequency: '439.750 MHz',
      mode: 'FM',
      type: 'received',
      contactType: 'repeater'
    }
  ];

  const getContactTypeLabel = (type) => {
    const types = {
      satellite: '卫星通联',
      shortwave: '短波通联',
      repeater: '中继通联',
      direct: '本地直频',
      eyeball_offline: '线下EYEBALL',
      eyeball_online: '线上EYEBALL'
    };
    return types[type] || '其他';
  };

  const getTypeColor = (type) => {
    return type === 'received' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">仪表盘</h1>
          <p className="text-muted-foreground mt-1">
            业余无线电卡片管理系统概览
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总卡片数</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCards}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.thisMonthCards}</span> 本月新增
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">收到卡片</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.receivedCards}</div>
            <p className="text-xs text-muted-foreground">
              占总数 {Math.round((stats.receivedCards / stats.totalCards) * 100)}%
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">发出卡片</CardTitle>
            <Radio className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.sentCards}</div>
            <p className="text-xs text-muted-foreground">
              占总数 {Math.round((stats.sentCards / stats.totalCards) * 100)}%
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EYEBALL卡</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.eyeballCards}</div>
            <p className="text-xs text-muted-foreground">
              特殊通联记录
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            快速操作
          </CardTitle>
          <CardDescription>
            常用功能快速入口
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <QrCode className="h-6 w-6" />
              <span className="text-sm">扫描二维码</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Radio className="h-6 w-6" />
              <span className="text-sm">RFID读取</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <CreditCard className="h-6 w-6" />
              <span className="text-sm">添加卡片</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">呼号查询</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 最近卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            最近卡片
          </CardTitle>
          <CardDescription>
            最新的卡片记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCards.map((card) => (
              <div key={card.id} className="radio-card">
                <div className="radio-card-header">
                  <div>
                    <div className="radio-card-title">{card.callsign}</div>
                    <div className="radio-card-subtitle">{card.name}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getTypeColor(card.type)}>
                      {card.type === 'received' ? '收到' : '发出'}
                    </Badge>
                    <Badge variant="outline">
                      {getContactTypeLabel(card.contactType)}
                    </Badge>
                  </div>
                </div>
                <div className="radio-card-content">
                  <div className="radio-card-field">
                    <span className="radio-card-label">日期:</span>
                    <span className="radio-card-value">{card.date}</span>
                  </div>
                  <div className="radio-card-field">
                    <span className="radio-card-label">频率:</span>
                    <span className="radio-card-value">{card.frequency}</span>
                  </div>
                  <div className="radio-card-field">
                    <span className="radio-card-label">模式:</span>
                    <span className="radio-card-value">{card.mode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline">查看更多卡片</Button>
          </div>
        </CardContent>
      </Card>

      {/* 系统状态 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">系统状态</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">活跃RFID设备</span>
              <Badge variant="outline">{stats.activeDevices} 台</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">卡片分类</span>
              <Badge variant="outline">{stats.categories} 个</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">呼号关联</span>
              <Badge variant="outline">{stats.associations} 个</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">最近活动</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">2分钟前</span>
                <span>收到新卡片 JA1ABC</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">15分钟前</span>
                <span>发送卡片 VK2DEF</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-muted-foreground">1小时前</span>
                <span>创建EYEBALL卡片</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;


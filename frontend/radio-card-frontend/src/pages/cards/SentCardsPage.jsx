import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Filter, 
  Download,
  Upload,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react';

const SentCardsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 模拟数据
  useEffect(() => {
    const mockCards = [
      {
        id: '1',
        callsign: 'JA1ABC',
        name: '田中太郎',
        qth: '东京都',
        date: '2025-06-08',
        sentDate: '2025-06-09',
        frequency: '14.205 MHz',
        mode: 'SSB',
        contactType: 'shortwave',
        status: 'delivered',
        trackingNumber: 'JP123456789',
        method: 'direct'
      },
      {
        id: '2',
        callsign: 'VK2DEF',
        name: 'John Smith',
        qth: '悉尼',
        date: '2025-06-07',
        sentDate: '2025-06-08',
        frequency: '21.300 MHz',
        mode: 'CW',
        contactType: 'shortwave',
        status: 'sent',
        trackingNumber: 'AU987654321',
        method: 'bureau'
      },
      {
        id: '3',
        callsign: 'BH1GHI',
        name: '李明',
        qth: '北京',
        date: '2025-06-06',
        sentDate: '2025-06-07',
        frequency: '439.750 MHz',
        mode: 'FM',
        contactType: 'repeater',
        status: 'confirmed',
        trackingNumber: '',
        method: 'eqsl'
      },
      {
        id: '4',
        callsign: 'HL9JKL',
        name: '김철수',
        qth: '首尔',
        date: '2025-06-05',
        sentDate: '2025-06-06',
        frequency: '7.074 MHz',
        mode: 'FT8',
        contactType: 'digital',
        status: 'pending',
        trackingNumber: '',
        method: 'lotw'
      },
      {
        id: '5',
        callsign: 'W1MNO',
        name: 'Mike Johnson',
        qth: '纽约',
        date: '2025-06-04',
        sentDate: '',
        frequency: '28.400 MHz',
        mode: 'SSB',
        contactType: 'shortwave',
        status: 'preparing',
        trackingNumber: '',
        method: 'direct'
      }
    ];
    
    setTimeout(() => {
      setCards(mockCards);
      setLoading(false);
    }, 1000);
  }, []);

  const getContactTypeLabel = (type) => {
    const types = {
      satellite: '卫星通联',
      shortwave: '短波通联',
      repeater: '中继通联',
      direct: '本地直频',
      digital: '数字模式',
      eyeball_offline: '线下EYEBALL',
      eyeball_online: '线上EYEBALL'
    };
    return types[type] || '其他';
  };

  const getStatusColor = (status) => {
    const colors = {
      preparing: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      confirmed: 'bg-emerald-100 text-emerald-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      preparing: '准备中',
      pending: '待发送',
      sent: '已发送',
      delivered: '已送达',
      confirmed: '已确认',
      failed: '发送失败'
    };
    return labels[status] || '未知';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'preparing':
        return <Clock className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'sent':
        return <Send className="h-3 w-3" />;
      case 'delivered':
        return <CheckCircle className="h-3 w-3" />;
      case 'confirmed':
        return <CheckCircle className="h-3 w-3" />;
      case 'failed':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getMethodLabel = (method) => {
    const methods = {
      direct: '直接邮寄',
      bureau: 'QSL局',
      eqsl: 'eQSL',
      lotw: 'LoTW',
      qrz: 'QRZ.com'
    };
    return methods[method] || '其他';
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.qth.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && card.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">发出的卡片</h1>
            <p className="text-gray-500 mt-1">管理您发出的QSL卡片</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-500">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">发出的卡片</h1>
          <p className="text-gray-500 mt-1">
            管理您发出的QSL卡片 ({filteredCards.length} 张)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            批量导入
          </Button>
          <Button size="sm" onClick={() => navigate('/cards/add')}>
            <Plus className="h-4 w-4 mr-2" />
            发送卡片
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索呼号、姓名或QTH..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">所有状态</option>
                <option value="preparing">准备中</option>
                <option value="pending">待发送</option>
                <option value="sent">已发送</option>
                <option value="delivered">已送达</option>
                <option value="confirmed">已确认</option>
                <option value="failed">发送失败</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="stats-card">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {cards.filter(c => c.status === 'confirmed').length}
            </div>
            <p className="text-sm text-gray-600">已确认</p>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {cards.filter(c => c.status === 'delivered').length}
            </div>
            <p className="text-sm text-gray-600">已送达</p>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">
              {cards.filter(c => ['pending', 'sent'].includes(c.status)).length}
            </div>
            <p className="text-sm text-gray-600">处理中</p>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-600">
              {cards.filter(c => c.status === 'preparing').length}
            </div>
            <p className="text-sm text-gray-600">准备中</p>
          </CardContent>
        </Card>
      </div>

      {/* 卡片列表 */}
      <div className="space-y-4">
        {filteredCards.map((card) => (
          <Card key={card.id} className="radio-card hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/cards/${card.id}`)}>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-blue-600">{card.callsign}</h3>
                    <Badge className={getStatusColor(card.status)}>
                      {getStatusIcon(card.status)}
                      <span className="ml-1">{getStatusLabel(card.status)}</span>
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getMethodLabel(card.method)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">{card.name}</span> - {card.qth}
                    </div>
                    <div>
                      通联: {card.date} | {card.frequency} {card.mode}
                    </div>
                    <div>
                      {card.sentDate ? `发送: ${card.sentDate}` : '未发送'}
                    </div>
                  </div>
                  
                  {card.trackingNumber && (
                    <div className="mt-2 text-xs text-gray-500">
                      跟踪号: {card.trackingNumber}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getContactTypeLabel(card.contactType)}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 空状态 */}
      {filteredCards.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? '未找到匹配的卡片' : '还没有发送卡片'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? '尝试调整搜索条件' : '开始发送您的第一张QSL卡片吧'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/cards/add')}>
                <Plus className="h-4 w-4 mr-2" />
                发送第一张卡片
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* 快速操作浮动按钮 (移动端) */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button 
          size="lg" 
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => navigate('/cards/add')}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default SentCardsPage;


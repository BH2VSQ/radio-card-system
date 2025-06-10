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
  QrCode,
  Radio,
  Calendar,
  MapPin,
  Eye,
  MoreHorizontal
} from 'lucide-react';

const ReceivedCardsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
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
        time: '14:30',
        frequency: '14.205 MHz',
        mode: 'SSB',
        rst_sent: '59',
        rst_received: '59',
        contactType: 'shortwave',
        qslStatus: 'confirmed',
        hasImage: true,
        notes: '很棒的通联，信号很强'
      },
      {
        id: '2',
        callsign: 'VK2DEF',
        name: 'John Smith',
        qth: '悉尼',
        date: '2025-06-07',
        time: '09:15',
        frequency: '21.300 MHz',
        mode: 'CW',
        rst_sent: '599',
        rst_received: '579',
        contactType: 'shortwave',
        qslStatus: 'pending',
        hasImage: false,
        notes: ''
      },
      {
        id: '3',
        callsign: 'BH1GHI',
        name: '李明',
        qth: '北京',
        date: '2025-06-06',
        time: '20:45',
        frequency: '439.750 MHz',
        mode: 'FM',
        rst_sent: '59',
        rst_received: '59',
        contactType: 'repeater',
        qslStatus: 'confirmed',
        hasImage: true,
        notes: '通过中继台通联'
      },
      {
        id: '4',
        callsign: 'HL9JKL',
        name: '김철수',
        qth: '首尔',
        date: '2025-06-05',
        time: '16:20',
        frequency: '7.074 MHz',
        mode: 'FT8',
        rst_sent: '-10',
        rst_received: '-08',
        contactType: 'digital',
        qslStatus: 'confirmed',
        hasImage: false,
        notes: 'FT8数字模式通联'
      },
      {
        id: '5',
        callsign: 'W1MNO',
        name: 'Mike Johnson',
        qth: '纽约',
        date: '2025-06-04',
        time: '03:30',
        frequency: '28.400 MHz',
        mode: 'SSB',
        rst_sent: '59',
        rst_received: '57',
        contactType: 'shortwave',
        qslStatus: 'pending',
        hasImage: true,
        notes: '10米波段开通时的通联'
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
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      confirmed: '已确认',
      pending: '待确认',
      rejected: '已拒绝'
    };
    return labels[status] || '未知';
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.qth.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && card.contactType === filterType;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">收到的卡片</h1>
            <p className="text-gray-500 mt-1">管理您收到的QSL卡片</p>
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
          <h1 className="text-3xl font-bold text-gray-900">收到的卡片</h1>
          <p className="text-gray-500 mt-1">
            管理您收到的QSL卡片 ({filteredCards.length} 张)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            导入
          </Button>
          <Button size="sm" onClick={() => navigate('/cards/add')}>
            <Plus className="h-4 w-4 mr-2" />
            添加卡片
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">所有类型</option>
                <option value="shortwave">短波通联</option>
                <option value="repeater">中继通联</option>
                <option value="satellite">卫星通联</option>
                <option value="digital">数字模式</option>
                <option value="direct">本地直频</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card) => (
          <Card key={card.id} className="radio-card hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/cards/${card.id}`)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-blue-600">
                    {card.callsign}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-gray-700">
                    {card.name}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  {card.hasImage && (
                    <Badge variant="outline" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      图片
                    </Badge>
                  )}
                  <Badge className={getStatusColor(card.qslStatus)}>
                    {getStatusLabel(card.qslStatus)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{card.qth}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{card.date}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">频率:</span>
                  <span className="font-medium">{card.frequency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">模式:</span>
                  <span className="font-medium">{card.mode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">RST:</span>
                  <span className="font-medium">{card.rst_sent}/{card.rst_received}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <Badge variant="outline" className="text-xs">
                  {getContactTypeLabel(card.contactType)}
                </Badge>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {card.notes && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  {card.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 空状态 */}
      {filteredCards.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Radio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? '未找到匹配的卡片' : '还没有收到卡片'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? '尝试调整搜索条件' : '开始您的第一次通联吧'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/cards/add')}>
                <Plus className="h-4 w-4 mr-2" />
                添加第一张卡片
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

export default ReceivedCardsPage;


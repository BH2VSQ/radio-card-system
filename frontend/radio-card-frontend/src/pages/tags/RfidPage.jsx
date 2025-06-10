import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Radio, 
  Wifi, 
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Scan,
  FileText,
  History,
  Settings,
  Bluetooth,
  Smartphone
} from 'lucide-react';

const RfidPage = () => {
  const [isReading, setIsReading] = useState(false);
  const [readResult, setReadResult] = useState(null);
  const [readHistory, setReadHistory] = useState([]);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState(null);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);

  // 检查NFC支持
  useEffect(() => {
    // 检查浏览器是否支持Web NFC API
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    } else {
      setNfcSupported(false);
    }

    // 模拟RFID设备连接状态
    setDeviceConnected(true);

    // 模拟读取历史
    const mockHistory = [
      {
        id: '1',
        tagId: 'RFID-001-JA1ABC',
        content: 'QSL-JA1ABC-20250608-001',
        type: 'qsl_card',
        timestamp: '2025-06-08 14:30:25',
        status: 'processed',
        cardInfo: {
          callsign: 'JA1ABC',
          name: '田中太郎',
          date: '2025-06-08',
          frequency: '14.205 MHz',
          mode: 'SSB'
        },
        rssi: -45
      },
      {
        id: '2',
        tagId: 'NFC-002-VK2DEF',
        content: 'QSL-VK2DEF-20250607-002',
        type: 'nfc_tag',
        timestamp: '2025-06-07 09:15:10',
        status: 'processed',
        cardInfo: {
          callsign: 'VK2DEF',
          name: 'John Smith',
          date: '2025-06-07',
          frequency: '21.300 MHz',
          mode: 'CW'
        },
        rssi: -38
      },
      {
        id: '3',
        tagId: 'RFID-003-BH1GHI',
        content: 'EYEBALL-MEETING-20250606',
        type: 'eyeball_event',
        timestamp: '2025-06-06 20:45:33',
        status: 'processed',
        rssi: -52
      },
      {
        id: '4',
        tagId: 'UNKNOWN-004',
        content: 'INVALID-TAG-DATA',
        type: 'unknown',
        timestamp: '2025-06-05 16:20:15',
        status: 'error',
        rssi: -65
      }
    ];
    setReadHistory(mockHistory);
  }, []);

  // 开始RFID/NFC读取
  const startReading = async () => {
    setError(null);
    setIsReading(true);

    if (nfcSupported) {
      try {
        // 使用Web NFC API
        const ndef = new NDEFReader();
        await ndef.scan();
        
        ndef.addEventListener('reading', ({ message, serialNumber }) => {
          console.log('NFC tag detected:', serialNumber);
          simulateRead('NFC');
        });

        ndef.addEventListener('readingerror', () => {
          setError('NFC读取失败，请重试');
          setIsReading(false);
        });

      } catch (err) {
        console.error('NFC error:', err);
        setError('NFC功能不可用，使用模拟读取');
        // 降级到模拟读取
        setTimeout(() => {
          simulateRead('RFID');
        }, 2000);
      }
    } else {
      // 模拟RFID读取
      setTimeout(() => {
        simulateRead('RFID');
      }, 2000);
    }
  };

  // 停止读取
  const stopReading = () => {
    setIsReading(false);
    setError(null);
  };

  // 模拟读取结果
  const simulateRead = (type) => {
    const mockResults = [
      {
        tagId: `${type}-${Date.now()}-BH2VSQ`,
        content: 'QSL-BH2VSQ-20250610-001',
        type: 'qsl_card',
        cardInfo: {
          callsign: 'BH2VSQ',
          name: '测试用户',
          date: '2025-06-10',
          frequency: '14.205 MHz',
          mode: 'SSB'
        },
        rssi: Math.floor(Math.random() * 30) - 70
      },
      {
        tagId: `${type}-${Date.now()}-EYEBALL`,
        content: 'EYEBALL-MEETING-20250610',
        type: 'eyeball_event',
        rssi: Math.floor(Math.random() * 30) - 70
      },
      {
        tagId: `${type}-${Date.now()}-CERT`,
        content: 'CERTIFICATE-HAM-20250610',
        type: 'certificate',
        rssi: Math.floor(Math.random() * 30) - 70
      }
    ];

    const result = mockResults[Math.floor(Math.random() * mockResults.length)];
    const newReadResult = {
      ...result,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('zh-CN'),
      status: 'processed'
    };

    setReadResult(newReadResult);
    setReadHistory(prev => [newReadResult, ...prev]);
    setIsReading(false);
  };

  // 手动输入处理
  const handleManualInput = () => {
    if (!manualInput.trim()) {
      setError('请输入有效的RFID标签内容');
      return;
    }

    const result = {
      id: Date.now().toString(),
      tagId: `MANUAL-${Date.now()}`,
      content: manualInput.trim(),
      type: 'manual',
      timestamp: new Date().toLocaleString('zh-CN'),
      status: 'processed',
      rssi: 0
    };

    setReadResult(result);
    setReadHistory(prev => [result, ...prev]);
    setManualInput('');
    setError(null);
  };

  // 获取类型标签
  const getTypeLabel = (type) => {
    const types = {
      qsl_card: 'QSL卡片',
      nfc_tag: 'NFC标签',
      rfid_tag: 'RFID标签',
      eyeball_event: 'EYEBALL活动',
      certificate: '证书标签',
      manual: '手动输入',
      unknown: '未知类型'
    };
    return types[type] || '其他';
  };

  // 获取状态颜色
  const getStatusColor = (status) => {
    const colors = {
      processed: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // 获取状态图标
  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // 获取信号强度颜色
  const getRssiColor = (rssi) => {
    if (rssi > -40) return 'text-green-600';
    if (rssi > -60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RFID/NFC读取</h1>
          <p className="text-gray-500 mt-1">读取RFID标签和NFC芯片信息</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            设备设置
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            导出数据
          </Button>
        </div>
      </div>

      {/* 设备状态 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${deviceConnected ? 'bg-green-100' : 'bg-red-100'}`}>
                <Radio className={`h-5 w-5 ${deviceConnected ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="font-medium">RFID设备</p>
                <p className={`text-sm ${deviceConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {deviceConnected ? '已连接' : '未连接'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${nfcSupported ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Bluetooth className={`h-5 w-5 ${nfcSupported ? 'text-blue-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="font-medium">NFC功能</p>
                <p className={`text-sm ${nfcSupported ? 'text-blue-600' : 'text-gray-600'}`}>
                  {nfcSupported ? '支持' : '不支持'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <Smartphone className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">PDA模式</p>
                <p className="text-sm text-purple-600">已启用</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 读取区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RFID/NFC读取 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              RFID/NFC读取
            </CardTitle>
            <CardDescription>
              将RFID标签或NFC芯片靠近读取器
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 读取区域 */}
            <div className="relative">
              <div className="scan-area min-h-[300px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-300">
                {isReading ? (
                  <div className="text-center">
                    <div className="relative">
                      <div className="w-24 h-24 mx-auto mb-4 relative">
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-ping"></div>
                        <div className="absolute inset-2 border-4 border-blue-300 rounded-full animate-ping animation-delay-200"></div>
                        <div className="absolute inset-4 border-4 border-blue-100 rounded-full animate-ping animation-delay-400"></div>
                        <Wifi className="absolute inset-0 m-auto h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-lg font-medium text-blue-600">正在读取...</p>
                    <p className="text-sm text-gray-500 mt-1">请将标签靠近读取器</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <Radio className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">准备读取</p>
                    <p className="text-sm">点击开始按钮启动读取器</p>
                  </div>
                )}
              </div>
            </div>

            {/* 读取控制按钮 */}
            <div className="flex gap-2">
              {!isReading ? (
                <Button onClick={startReading} className="flex-1 scan-button">
                  <Scan className="h-4 w-4 mr-2" />
                  开始读取
                </Button>
              ) : (
                <Button onClick={stopReading} variant="outline" className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" />
                  停止读取
                </Button>
              )}
            </div>

            {/* 设备信息 */}
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>读取频率: 13.56 MHz</div>
                <div>读取距离: 0-10cm</div>
                <div>支持协议: ISO14443A/B</div>
                <div>数据格式: NDEF</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 手动输入 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              手动输入
            </CardTitle>
            <CardDescription>
              手动输入RFID标签ID或NFC数据
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                标签内容
              </label>
              <Input
                placeholder="输入RFID标签ID或NFC数据..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
              />
            </div>
            
            <Button onClick={handleManualInput} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              处理输入
            </Button>

            {/* 常用格式示例 */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">常用格式示例：</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>• RFID标签: RFID-001-BH1ABC</p>
                <p>• NFC芯片: NFC-002-JA1DEF</p>
                <p>• 证书标签: CERT-HAM-20250610</p>
                <p>• 活动标签: EVENT-EYEBALL-001</p>
              </div>
            </div>

            {/* NFC支持提示 */}
            {!nfcSupported && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  当前浏览器不支持Web NFC API。建议使用支持NFC的Android设备和Chrome浏览器。
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 读取结果 */}
      {readResult && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              读取结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-lg">{readResult.content}</p>
                  <p className="text-sm text-gray-500">
                    标签ID: {readResult.tagId} | {readResult.timestamp}
                  </p>
                  {readResult.rssi !== 0 && (
                    <p className={`text-sm ${getRssiColor(readResult.rssi)}`}>
                      信号强度: {readResult.rssi} dBm
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {getTypeLabel(readResult.type)}
                  </Badge>
                  <Badge className={getStatusColor(readResult.status)}>
                    {getStatusIcon(readResult.status)}
                    <span className="ml-1">已处理</span>
                  </Badge>
                </div>
              </div>

              {/* 卡片信息 */}
              {readResult.cardInfo && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">识别的卡片信息：</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>呼号: {readResult.cardInfo.callsign}</div>
                    <div>姓名: {readResult.cardInfo.name}</div>
                    <div>日期: {readResult.cardInfo.date}</div>
                    {readResult.cardInfo.frequency && (
                      <div>频率: {readResult.cardInfo.frequency}</div>
                    )}
                    {readResult.cardInfo.mode && (
                      <div>模式: {readResult.cardInfo.mode}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  查看详情
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  写入标签
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误提示 */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* 读取历史 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            读取历史
          </CardTitle>
          <CardDescription>
            最近的读取记录 ({readHistory.length} 条)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {readHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.content}</p>
                  <p className="text-xs text-gray-500">
                    {item.tagId} | {item.timestamp}
                  </p>
                  {item.cardInfo && (
                    <p className="text-xs text-blue-600 mt-1">
                      {item.cardInfo.callsign} - {item.cardInfo.name}
                    </p>
                  )}
                  {item.rssi !== 0 && (
                    <p className={`text-xs ${getRssiColor(item.rssi)}`}>
                      {item.rssi} dBm
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(item.type)}
                  </Badge>
                  <Badge className={getStatusColor(item.status)}>
                    {getStatusIcon(item.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 移动端快速读取按钮 */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button 
          size="lg" 
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={isReading ? stopReading : startReading}
        >
          {isReading ? (
            <XCircle className="h-6 w-6" />
          ) : (
            <Radio className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default RfidPage;


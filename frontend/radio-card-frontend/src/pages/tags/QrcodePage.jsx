import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  QrCode, 
  Camera, 
  Upload, 
  Download,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Scan,
  FileText,
  History
} from 'lucide-react';

const QrcodePage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // 模拟扫描历史
  useEffect(() => {
    const mockHistory = [
      {
        id: '1',
        content: 'QSL-JA1ABC-20250608-001',
        type: 'qsl_card',
        timestamp: '2025-06-08 14:30:25',
        status: 'processed',
        cardInfo: {
          callsign: 'JA1ABC',
          name: '田中太郎',
          date: '2025-06-08'
        }
      },
      {
        id: '2',
        content: 'RFID-VK2DEF-20250607-002',
        type: 'rfid_tag',
        timestamp: '2025-06-07 09:15:10',
        status: 'processed',
        cardInfo: {
          callsign: 'VK2DEF',
          name: 'John Smith',
          date: '2025-06-07'
        }
      },
      {
        id: '3',
        content: 'https://qrz.com/db/BH1GHI',
        type: 'url',
        timestamp: '2025-06-06 20:45:33',
        status: 'processed'
      },
      {
        id: '4',
        content: 'INVALID-CODE-123',
        type: 'unknown',
        timestamp: '2025-06-05 16:20:15',
        status: 'error'
      }
    ];
    setScanHistory(mockHistory);
  }, []);

  // 检查摄像头权限
  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setCameraPermission('granted');
      return stream;
    } catch (err) {
      console.error('Camera permission error:', err);
      setCameraPermission('denied');
      setError('无法访问摄像头，请检查权限设置');
      return null;
    }
  };

  // 开始扫描
  const startScanning = async () => {
    setError(null);
    setIsScanning(true);
    
    const stream = await checkCameraPermission();
    if (!stream) {
      setIsScanning(false);
      return;
    }

    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }

    // 模拟扫描过程
    setTimeout(() => {
      simulateScan();
    }, 3000);
  };

  // 停止扫描
  const stopScanning = () => {
    setIsScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // 模拟扫描结果
  const simulateScan = () => {
    const mockResults = [
      {
        content: 'QSL-BH2VSQ-20250610-001',
        type: 'qsl_card',
        cardInfo: {
          callsign: 'BH2VSQ',
          name: '测试用户',
          date: '2025-06-10',
          frequency: '14.205 MHz',
          mode: 'SSB'
        }
      },
      {
        content: 'https://qrz.com/db/BH2VSQ',
        type: 'url'
      },
      {
        content: 'EYEBALL-MEETING-20250610',
        type: 'eyeball_event'
      }
    ];

    const result = mockResults[Math.floor(Math.random() * mockResults.length)];
    const newScanResult = {
      ...result,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('zh-CN'),
      status: 'processed'
    };

    setScanResult(newScanResult);
    setScanHistory(prev => [newScanResult, ...prev]);
    stopScanning();
  };

  // 手动输入处理
  const handleManualInput = () => {
    if (!manualInput.trim()) {
      setError('请输入有效的二维码内容');
      return;
    }

    const result = {
      id: Date.now().toString(),
      content: manualInput.trim(),
      type: 'manual',
      timestamp: new Date().toLocaleString('zh-CN'),
      status: 'processed'
    };

    setScanResult(result);
    setScanHistory(prev => [result, ...prev]);
    setManualInput('');
    setError(null);
  };

  // 获取类型标签
  const getTypeLabel = (type) => {
    const types = {
      qsl_card: 'QSL卡片',
      rfid_tag: 'RFID标签',
      url: '网址链接',
      eyeball_event: 'EYEBALL活动',
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">二维码扫描</h1>
          <p className="text-gray-500 mt-1">扫描QSL卡片上的二维码或RFID标签</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出历史
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            导入数据
          </Button>
        </div>
      </div>

      {/* 扫描区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 摄像头扫描 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              摄像头扫描
            </CardTitle>
            <CardDescription>
              使用设备摄像头扫描二维码
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 摄像头预览区域 */}
            <div className="relative">
              <div className="scan-area min-h-[300px] flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
                {isScanning ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    {/* 扫描框 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-blue-500 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>
                        {/* 扫描线动画 */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>
                      </div>
                    </div>
                    {/* 扫描提示 */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                      <p className="text-sm">将二维码对准扫描框</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <QrCode className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">准备扫描</p>
                    <p className="text-sm">点击开始按钮启动摄像头</p>
                  </div>
                )}
              </div>
            </div>

            {/* 扫描控制按钮 */}
            <div className="flex gap-2">
              {!isScanning ? (
                <Button onClick={startScanning} className="flex-1 scan-button">
                  <Scan className="h-4 w-4 mr-2" />
                  开始扫描
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="outline" className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" />
                  停止扫描
                </Button>
              )}
            </div>

            {/* 权限提示 */}
            {cameraPermission === 'denied' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  无法访问摄像头。请在浏览器设置中允许摄像头权限，或使用手动输入功能。
                </AlertDescription>
              </Alert>
            )}
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
              手动输入二维码内容或RFID标签信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                二维码内容
              </label>
              <Input
                placeholder="输入二维码内容或RFID标签信息..."
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
                <p>• QSL卡片: QSL-BH1ABC-20250608-001</p>
                <p>• RFID标签: RFID-JA1DEF-20250607-002</p>
                <p>• 网址链接: https://qrz.com/db/callsign</p>
                <p>• EYEBALL活动: EYEBALL-MEETING-20250610</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 扫描结果 */}
      {scanResult && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              扫描结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-lg">{scanResult.content}</p>
                  <p className="text-sm text-gray-500">{scanResult.timestamp}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {getTypeLabel(scanResult.type)}
                  </Badge>
                  <Badge className={getStatusColor(scanResult.status)}>
                    {getStatusIcon(scanResult.status)}
                    <span className="ml-1">已处理</span>
                  </Badge>
                </div>
              </div>

              {/* 卡片信息 */}
              {scanResult.cardInfo && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">识别的卡片信息：</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>呼号: {scanResult.cardInfo.callsign}</div>
                    <div>姓名: {scanResult.cardInfo.name}</div>
                    <div>日期: {scanResult.cardInfo.date}</div>
                    {scanResult.cardInfo.frequency && (
                      <div>频率: {scanResult.cardInfo.frequency}</div>
                    )}
                    {scanResult.cardInfo.mode && (
                      <div>模式: {scanResult.cardInfo.mode}</div>
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
                  <Download className="h-4 w-4 mr-2" />
                  导出数据
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

      {/* 扫描历史 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            扫描历史
          </CardTitle>
          <CardDescription>
            最近的扫描记录 ({scanHistory.length} 条)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scanHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.content}</p>
                  <p className="text-xs text-gray-500">{item.timestamp}</p>
                  {item.cardInfo && (
                    <p className="text-xs text-blue-600 mt-1">
                      {item.cardInfo.callsign} - {item.cardInfo.name}
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

      {/* 移动端快速扫描按钮 */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button 
          size="lg" 
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={isScanning ? stopScanning : startScanning}
        >
          {isScanning ? (
            <XCircle className="h-6 w-6" />
          ) : (
            <QrCode className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default QrcodePage;


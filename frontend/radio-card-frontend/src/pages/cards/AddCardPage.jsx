import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { callsignProfileService } from '../../services/callsignProfile.service';
import { cardService } from '../../services/card.service';

const AddCardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [callsignProfiles, setCallsignProfiles] = useState([]);
  const [formData, setFormData] = useState({
    callsignProfile: '',
    callsign: '',
    name: '',
    qth: '',
    country: '',
    contactDate: new Date(),
    frequency: '',
    band: '',
    mode: '',
    contactType: 'shortwave',
    rstSent: '',
    rstReceived: '',
    qslStatus: 'pending',
    notes: '',
    isPublic: false,
    eyeballInfo: {
      isEyeball: false,
      meetingType: '',
      meetingLocation: '',
      meetingDate: null,
      meetingName: '',
      verificationMethod: 'in_person',
      verificationDetails: ''
    }
  });

  useEffect(() => {
    loadCallsignProfiles();
  }, []);

  const loadCallsignProfiles = async () => {
    try {
      const response = await callsignProfileService.getAll();
      setCallsignProfiles(response.data);
      
      // 如果有默认呼号档案，自动选择
      const defaultProfile = response.data.find(profile => profile.isDefault);
      if (defaultProfile) {
        setFormData(prev => ({
          ...prev,
          callsignProfile: defaultProfile._id
        }));
      }
    } catch (error) {
      toast({
        title: '加载失败',
        description: '无法加载呼号档案',
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.callsignProfile) {
      toast({
        title: '验证失败',
        description: '请选择呼号档案',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      await cardService.create(formData);
      toast({
        title: '创建成功',
        description: '卡片已成功添加'
      });
      navigate('/cards/received');
    } catch (error) {
      toast({
        title: '创建失败',
        description: error.response?.data?.message || '创建失败，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const contactTypes = [
    { value: 'satellite', label: '卫星通信' },
    { value: 'shortwave', label: '短波通信' },
    { value: 'repeater', label: '中继通信' },
    { value: 'direct', label: '直接通信' },
    { value: 'eyeball_offline', label: 'EYEBALL线下' },
    { value: 'eyeball_online', label: 'EYEBALL线上' },
    { value: 'other', label: '其他' }
  ];

  const modes = [
    'CW', 'SSB', 'FM', 'AM', 'RTTY', 'PSK31', 'FT8', 'FT4', 'JT65', 'JT9', 'MFSK', 'OLIVIA', 'PACKET', 'WINMOR'
  ];

  const bands = [
    '160m', '80m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', '6m', '4m', '2m', '70cm', '23cm'
  ];

  const qslStatuses = [
    { value: 'pending', label: '待处理' },
    { value: 'sent', label: '已发送' },
    { value: 'received', label: '已收到' },
    { value: 'confirmed', label: '已确认' }
  ];

  const meetingTypes = [
    { value: 'hamfest', label: '业余无线电节' },
    { value: 'convention', label: '大会' },
    { value: 'club_meeting', label: '俱乐部聚会' },
    { value: 'personal_visit', label: '个人拜访' },
    { value: 'field_day', label: '野外日' },
    { value: 'contest', label: '竞赛' },
    { value: 'other', label: '其他' }
  ];

  const verificationMethods = [
    { value: 'in_person', label: '面对面' },
    { value: 'photo', label: '照片' },
    { value: 'video', label: '视频' },
    { value: 'third_party', label: '第三方' },
    { value: 'other', label: '其他' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">添加卡片</h1>
        <p className="text-muted-foreground mt-1">
          添加新的QSL卡片记录
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>
              填写QSL卡片的基本信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="callsignProfile">我的呼号档案 *</Label>
                <Select
                  value={formData.callsignProfile}
                  onValueChange={(value) => handleInputChange('callsignProfile', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择呼号档案" />
                  </SelectTrigger>
                  <SelectContent>
                    {callsignProfiles.map((profile) => (
                      <SelectItem key={profile._id} value={profile._id}>
                        <div className="flex items-center gap-2">
                          {profile.callsignName}
                          {profile.isDefault && (
                            <Badge variant="secondary" className="text-xs">默认</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="callsign">对方呼号 *</Label>
                <Input
                  id="callsign"
                  value={formData.callsign}
                  onChange={(e) => handleInputChange('callsign', e.target.value.toUpperCase())}
                  placeholder="例如: BH1ABC"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">对方姓名</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="对方姓名"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qth">对方QTH</Label>
                <Input
                  id="qth"
                  value={formData.qth}
                  onChange={(e) => handleInputChange('qth', e.target.value)}
                  placeholder="对方电台位置"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">国家/地区</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="国家或地区"
                />
              </div>

              <div className="space-y-2">
                <Label>联络日期 *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.contactDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.contactDate ? format(formData.contactDate, "yyyy-MM-dd") : "选择日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.contactDate}
                      onSelect={(date) => handleInputChange('contactDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 技术信息 */}
        <Card>
          <CardHeader>
            <CardTitle>技术信息</CardTitle>
            <CardDescription>
              填写通信的技术参数
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">频率 (MHz) *</Label>
                <Input
                  id="frequency"
                  type="number"
                  step="0.001"
                  value={formData.frequency}
                  onChange={(e) => handleInputChange('frequency', e.target.value)}
                  placeholder="例如: 14.205"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="band">波段</Label>
                <Select
                  value={formData.band}
                  onValueChange={(value) => handleInputChange('band', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择波段" />
                  </SelectTrigger>
                  <SelectContent>
                    {bands.map((band) => (
                      <SelectItem key={band} value={band}>{band}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">模式 *</Label>
                <Select
                  value={formData.mode}
                  onValueChange={(value) => handleInputChange('mode', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择模式" />
                  </SelectTrigger>
                  <SelectContent>
                    {modes.map((mode) => (
                      <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactType">联络类型</Label>
                <Select
                  value={formData.contactType}
                  onValueChange={(value) => handleInputChange('contactType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择联络类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rstSent">发送RST</Label>
                <Input
                  id="rstSent"
                  value={formData.rstSent}
                  onChange={(e) => handleInputChange('rstSent', e.target.value)}
                  placeholder="例如: 599"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rstReceived">接收RST</Label>
                <Input
                  id="rstReceived"
                  value={formData.rstReceived}
                  onChange={(e) => handleInputChange('rstReceived', e.target.value)}
                  placeholder="例如: 599"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qslStatus">QSL状态</Label>
              <Select
                value={formData.qslStatus}
                onValueChange={(value) => handleInputChange('qslStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择QSL状态" />
                </SelectTrigger>
                <SelectContent>
                  {qslStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* EYEBALL信息 */}
        <Card>
          <CardHeader>
            <CardTitle>EYEBALL信息</CardTitle>
            <CardDescription>
              如果这是EYEBALL联络，请填写相关信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isEyeball"
                checked={formData.eyeballInfo.isEyeball}
                onCheckedChange={(checked) => handleInputChange('eyeballInfo.isEyeball', checked)}
              />
              <Label htmlFor="isEyeball">这是EYEBALL联络</Label>
            </div>

            {formData.eyeballInfo.isEyeball && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meetingType">聚会类型</Label>
                  <Select
                    value={formData.eyeballInfo.meetingType}
                    onValueChange={(value) => handleInputChange('eyeballInfo.meetingType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择聚会类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {meetingTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetingLocation">聚会地点</Label>
                  <Input
                    id="meetingLocation"
                    value={formData.eyeballInfo.meetingLocation}
                    onChange={(e) => handleInputChange('eyeballInfo.meetingLocation', e.target.value)}
                    placeholder="聚会地点"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetingName">聚会名称</Label>
                  <Input
                    id="meetingName"
                    value={formData.eyeballInfo.meetingName}
                    onChange={(e) => handleInputChange('eyeballInfo.meetingName', e.target.value)}
                    placeholder="聚会名称"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verificationMethod">验证方式</Label>
                  <Select
                    value={formData.eyeballInfo.verificationMethod}
                    onValueChange={(value) => handleInputChange('eyeballInfo.verificationMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择验证方式" />
                    </SelectTrigger>
                    <SelectContent>
                      {verificationMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="verificationDetails">验证详情</Label>
                  <Textarea
                    id="verificationDetails"
                    value={formData.eyeballInfo.verificationDetails}
                    onChange={(e) => handleInputChange('eyeballInfo.verificationDetails', e.target.value)}
                    placeholder="验证详情描述"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 其他信息 */}
        <Card>
          <CardHeader>
            <CardTitle>其他信息</CardTitle>
            <CardDescription>
              备注和其他设置
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="备注信息"
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
              />
              <Label htmlFor="isPublic">公开此卡片</Label>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/cards/received')}
          >
            取消
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '创建中...' : '创建卡片'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddCardPage;


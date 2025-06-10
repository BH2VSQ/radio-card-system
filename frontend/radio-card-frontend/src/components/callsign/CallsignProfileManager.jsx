import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, StarOff, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { useToast } from '../ui/use-toast';
import { callsignProfileService } from '../../services/callsignProfile.service';

const CallsignProfileManager = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [formData, setFormData] = useState({
    callsignName: '',
    qth: '',
    qslAddress: '',
    gridSquare: '',
    licenseClass: '',
    description: '',
    equipment: '',
    antenna: '',
    power: '',
    isDefault: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await callsignProfileService.getAll();
      setProfiles(response.data);
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.response?.data?.message || '无法加载呼号档案',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProfile) {
        await callsignProfileService.update(editingProfile._id, formData);
        toast({
          title: '更新成功',
          description: '呼号档案已更新'
        });
      } else {
        await callsignProfileService.create(formData);
        toast({
          title: '创建成功',
          description: '新呼号档案已创建'
        });
      }
      setIsDialogOpen(false);
      resetForm();
      loadProfiles();
    } catch (error) {
      toast({
        title: '操作失败',
        description: error.response?.data?.message || '操作失败，请重试',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (profile) => {
    setEditingProfile(profile);
    setFormData({
      callsignName: profile.callsignName,
      qth: profile.qth || '',
      qslAddress: profile.qslAddress || '',
      gridSquare: profile.gridSquare || '',
      licenseClass: profile.licenseClass || '',
      description: profile.description || '',
      equipment: profile.equipment || '',
      antenna: profile.antenna || '',
      power: profile.power || '',
      isDefault: profile.isDefault
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (profileId) => {
    if (!confirm('确定要删除这个呼号档案吗？')) return;
    
    try {
      await callsignProfileService.delete(profileId);
      toast({
        title: '删除成功',
        description: '呼号档案已删除'
      });
      loadProfiles();
    } catch (error) {
      toast({
        title: '删除失败',
        description: error.response?.data?.message || '删除失败，请重试',
        variant: 'destructive'
      });
    }
  };

  const handleSetDefault = async (profileId) => {
    try {
      await callsignProfileService.setDefault(profileId);
      toast({
        title: '设置成功',
        description: '默认呼号已更新'
      });
      loadProfiles();
    } catch (error) {
      toast({
        title: '设置失败',
        description: error.response?.data?.message || '设置失败，请重试',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setEditingProfile(null);
    setFormData({
      callsignName: '',
      qth: '',
      qslAddress: '',
      gridSquare: '',
      licenseClass: '',
      description: '',
      equipment: '',
      antenna: '',
      power: '',
      isDefault: false
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">呼号档案管理</h2>
          <p className="text-muted-foreground">
            管理您的业余无线电呼号档案
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              添加呼号档案
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? '编辑呼号档案' : '添加呼号档案'}
              </DialogTitle>
              <DialogDescription>
                {editingProfile ? '修改呼号档案信息' : '创建新的呼号档案'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="callsignName">呼号 *</Label>
                  <Input
                    id="callsignName"
                    value={formData.callsignName}
                    onChange={(e) => handleInputChange('callsignName', e.target.value.toUpperCase())}
                    placeholder="例如: BH1ABC"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseClass">执照等级</Label>
                  <Select
                    value={formData.licenseClass}
                    onValueChange={(value) => handleInputChange('licenseClass', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择执照等级" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A类</SelectItem>
                      <SelectItem value="B">B类</SelectItem>
                      <SelectItem value="C">C类</SelectItem>
                      <SelectItem value="D">D类</SelectItem>
                      <SelectItem value="E">E类</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qth">QTH (电台位置)</Label>
                  <Input
                    id="qth"
                    value={formData.qth}
                    onChange={(e) => handleInputChange('qth', e.target.value)}
                    placeholder="例如: 北京市海淀区"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gridSquare">网格坐标</Label>
                  <Input
                    id="gridSquare"
                    value={formData.gridSquare}
                    onChange={(e) => handleInputChange('gridSquare', e.target.value.toUpperCase())}
                    placeholder="例如: OM89"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qslAddress">QSL地址</Label>
                <Textarea
                  id="qslAddress"
                  value={formData.qslAddress}
                  onChange={(e) => handleInputChange('qslAddress', e.target.value)}
                  placeholder="QSL卡片邮寄地址"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipment">设备</Label>
                  <Input
                    id="equipment"
                    value={formData.equipment}
                    onChange={(e) => handleInputChange('equipment', e.target.value)}
                    placeholder="例如: IC-7300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="power">功率 (W)</Label>
                  <Input
                    id="power"
                    type="number"
                    value={formData.power}
                    onChange={(e) => handleInputChange('power', e.target.value)}
                    placeholder="例如: 100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="antenna">天线</Label>
                <Input
                  id="antenna"
                  value={formData.antenna}
                  onChange={(e) => handleInputChange('antenna', e.target.value)}
                  placeholder="例如: 八木天线"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="呼号档案描述或备注"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
                />
                <Label htmlFor="isDefault">设为默认呼号</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit">
                  {editingProfile ? '更新' : '创建'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Card key={profile._id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {profile.callsignName}
                  {profile.isDefault && (
                    <Badge variant="default" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      默认
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center space-x-1">
                  {!profile.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(profile._id)}
                      title="设为默认"
                    >
                      <StarOff className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(profile)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(profile._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {profile.licenseClass && (
                <Badge variant="secondary" className="w-fit">
                  {profile.licenseClass}类执照
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {profile.qth && (
                <div className="text-sm">
                  <span className="font-medium">QTH:</span> {profile.qth}
                </div>
              )}
              {profile.gridSquare && (
                <div className="text-sm">
                  <span className="font-medium">网格:</span> {profile.gridSquare}
                </div>
              )}
              {profile.equipment && (
                <div className="text-sm">
                  <span className="font-medium">设备:</span> {profile.equipment}
                </div>
              )}
              {profile.power && (
                <div className="text-sm">
                  <span className="font-medium">功率:</span> {profile.power}W
                </div>
              )}
              {profile.antenna && (
                <div className="text-sm">
                  <span className="font-medium">天线:</span> {profile.antenna}
                </div>
              )}
              {profile.description && (
                <div className="text-sm text-muted-foreground">
                  {profile.description}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {profiles.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无呼号档案</h3>
            <p className="text-muted-foreground text-center mb-4">
              您还没有创建任何呼号档案。点击上方按钮创建您的第一个呼号档案。
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              创建呼号档案
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CallsignProfileManager;


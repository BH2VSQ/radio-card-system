import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Star } from 'lucide-react';
import { callsignProfileService } from '../../services/callsignProfile.service';
import { useToast } from '../ui/use-toast';

const CallsignProfileSelector = ({ 
  value, 
  onValueChange, 
  placeholder = "选择呼号档案",
  showAllOption = true,
  className = ""
}) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await callsignProfileService.getAll();
      setProfiles(response.data);
      
      // 如果没有选择值且有默认档案，自动选择默认档案
      if (!value) {
        const defaultProfile = response.data.find(profile => profile.isDefault);
        if (defaultProfile && onValueChange) {
          onValueChange(defaultProfile._id);
        }
      }
    } catch (error) {
      toast({
        title: '加载失败',
        description: '无法加载呼号档案',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="加载中..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {showAllOption && (
          <SelectItem value="all">
            <span className="font-medium">所有呼号档案</span>
          </SelectItem>
        )}
        {profiles.map((profile) => (
          <SelectItem key={profile._id} value={profile._id}>
            <div className="flex items-center gap-2">
              <span>{profile.callsignName}</span>
              {profile.isDefault && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  默认
                </Badge>
              )}
              {profile.qth && (
                <span className="text-xs text-muted-foreground">
                  ({profile.qth})
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CallsignProfileSelector;


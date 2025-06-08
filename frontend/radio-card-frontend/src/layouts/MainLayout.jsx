import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  CreditCard, 
  QrCode, 
  Tag, 
  FolderTree, 
  Radio, 
  Users, 
  Award, 
  Settings, 
  Menu, 
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = () => {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const location = useLocation();
  const { logout } = useAuth();

  // 导航项
  const navItems = [
    { 
      title: '仪表盘', 
      icon: <LayoutDashboard className="h-4 w-4" />, 
      path: '/' 
    },
    { 
      title: '卡片管理', 
      icon: <CreditCard className="h-4 w-4" />, 
      path: '/cards',
      children: [
        { title: '收到的卡片', path: '/cards/received' },
        { title: '发出的卡片', path: '/cards/sent' },
        { title: 'EYEBALL卡片', path: '/cards/eyeball' }
      ]
    },
    { 
      title: '标签识别', 
      icon: <QrCode className="h-4 w-4" />, 
      path: '/tags',
      children: [
        { title: '二维码管理', path: '/tags/qrcode' },
        { title: 'RFID管理', path: '/tags/rfid' }
      ]
    },
    { 
      title: '分类管理', 
      icon: <FolderTree className="h-4 w-4" />, 
      path: '/categories' 
    },
    { 
      title: '标签管理', 
      icon: <Tag className="h-4 w-4" />, 
      path: '/tags/manage' 
    },
    { 
      title: 'RFID设备', 
      icon: <Radio className="h-4 w-4" />, 
      path: '/rfid-devices' 
    },
    { 
      title: '呼号关联', 
      icon: <Users className="h-4 w-4" />, 
      path: '/callsign-associations' 
    },
    { 
      title: '证书管理', 
      icon: <Award className="h-4 w-4" />, 
      path: '/certificates' 
    },
    { 
      title: '系统设置', 
      icon: <Settings className="h-4 w-4" />, 
      path: '/settings' 
    }
  ];

  const toggleExpanded = (path) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isParentActive = (item) => {
    if (item.children) {
      return item.children.some(child => location.pathname === child.path);
    }
    return false;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center space-x-2 px-2">
              <Radio className="h-8 w-8" />
              <span className="text-xl font-bold">无线电卡片系统</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  {item.children ? (
                    <>
                      <SidebarMenuButton
                        onClick={() => toggleExpanded(item.path)}
                        isActive={isParentActive(item)}
                        className="w-full justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <span>{item.title}</span>
                        </div>
                        {expandedItems.has(item.path) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </SidebarMenuButton>
                      {expandedItems.has(item.path) && (
                        <SidebarMenu className="ml-4 mt-1">
                          {item.children.map((child) => (
                            <SidebarMenuItem key={child.path}>
                              <SidebarMenuButton
                                asChild
                                isActive={isActive(child.path)}
                              >
                                <Link to={child.path}>
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.path)}
                    >
                      <Link to={item.path}>
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>退出登录</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;


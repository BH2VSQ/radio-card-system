import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarNav, 
  SidebarNavItem 
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
  LogOut 
} from 'lucide-react';

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // 检测屏幕尺寸
  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    checkSize();
    window.addEventListener('resize', checkSize);
    
    return () => {
      window.removeEventListener('resize', checkSize);
    };
  }, []);

  // 导航项
  const navItems = [
    { 
      title: '仪表盘', 
      icon: <LayoutDashboard className="h-5 w-5" />, 
      path: '/' 
    },
    { 
      title: '卡片管理', 
      icon: <CreditCard className="h-5 w-5" />, 
      path: '/cards',
      children: [
        { title: '收到的卡片', path: '/cards/received' },
        { title: '发出的卡片', path: '/cards/sent' },
        { title: 'EYEBALL卡片', path: '/cards/eyeball' }
      ]
    },
    { 
      title: '标签识别', 
      icon: <QrCode className="h-5 w-5" />, 
      path: '/tags',
      children: [
        { title: '二维码管理', path: '/tags/qrcode' },
        { title: 'RFID管理', path: '/tags/rfid' }
      ]
    },
    { 
      title: '分类管理', 
      icon: <FolderTree className="h-5 w-5" />, 
      path: '/categories' 
    },
    { 
      title: '标签管理', 
      icon: <Tag className="h-5 w-5" />, 
      path: '/tags/manage' 
    },
    { 
      title: 'RFID设备', 
      icon: <Radio className="h-5 w-5" />, 
      path: '/rfid-devices' 
    },
    { 
      title: '呼号关联', 
      icon: <Users className="h-5 w-5" />, 
      path: '/callsign-associations' 
    },
    { 
      title: '证书管理', 
      icon: <Award className="h-5 w-5" />, 
      path: '/certificates' 
    },
    { 
      title: '系统设置', 
      icon: <Settings className="h-5 w-5" />, 
      path: '/settings' 
    }
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* 移动端菜单按钮 */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* 侧边栏 */}
      <Sidebar
        collapsed={isMobile ? true : collapsed}
        open={isMobile ? mobileOpen : true}
        onOpenChange={isMobile ? setMobileOpen : undefined}
        className={isMobile ? "fixed inset-y-0 left-0 z-40" : ""}
      >
        <SidebarHeader>
          <div className="flex items-center space-x-2 px-2">
            <Radio className="h-8 w-8" />
            {!collapsed && <span className="text-xl font-bold">无线电卡片系统</span>}
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarNav>
            {navItems.map((item) => (
              <SidebarNavItem
                key={item.path}
                icon={item.icon}
                title={item.title}
                active={
                  location.pathname === item.path ||
                  (item.children && item.children.some(child => location.pathname === child.path))
                }
                collapsed={collapsed}
                subNav={
                  item.children && (
                    <SidebarNav>
                      {item.children.map((child) => (
                        <SidebarNavItem
                          key={child.path}
                          title={child.title}
                          active={location.pathname === child.path}
                          href={child.path}
                          component={Link}
                          to={child.path}
                        />
                      ))}
                    </SidebarNav>
                  )
                }
                href={item.children ? undefined : item.path}
                component={item.children ? undefined : Link}
                to={item.children ? undefined : item.path}
              />
            ))}
          </SidebarNav>
        </SidebarContent>
        
        <SidebarFooter>
          <div className="flex flex-col space-y-2 px-3">
            {!isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
                className="w-full justify-start"
              >
                <Menu className="h-4 w-4 mr-2" />
                {!collapsed && <span>收起菜单</span>}
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link to="/logout">
                <LogOut className="h-4 w-4 mr-2" />
                {!collapsed && <span>退出登录</span>}
              </Link>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;


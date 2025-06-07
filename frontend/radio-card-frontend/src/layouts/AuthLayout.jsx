import { Outlet } from 'react-router-dom';
import { Radio } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Radio className="h-12 w-12 text-primary" />
          <h1 className="mt-4 text-3xl font-bold">业余无线电卡片管理系统</h1>
          <p className="mt-2 text-muted-foreground">
            管理您的无线电通联卡片，支持二维码和RFID标签
          </p>
        </div>
        
        <div className="bg-card shadow-lg rounded-lg p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;


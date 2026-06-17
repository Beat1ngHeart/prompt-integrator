import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="text-6xl font-bold text-gray-200 dark:text-gray-800">404</div>
      <p className="text-lg font-medium text-gray-500 dark:text-gray-400">页面不存在</p>
      <p className="text-sm text-gray-400">请检查 URL 是否正确</p>
      <Button variant="secondary" onClick={() => navigate('/')}>
        <Home size={16} className="mr-1.5" />
        返回首页
      </Button>
    </div>
  );
}

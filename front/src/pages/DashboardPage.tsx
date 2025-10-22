import { useState, useEffect } from 'react';
import { useUser, UserButton, useAuth } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Send,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  Settings,
  CreditCard,
  Activity,
  Loader2,
  Palette,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '@/config';

interface UserStats {
  totalReleases: number;
  totalDistributions: number;
  totalCredits: number;
  usedCredits: number;
  planName: string;
  planLimit: number;
  mediaCount?: number;
}

interface RecentRelease {
  id: number;
  title: string;
  createdAt: string;
  status: 'draft' | 'sent' | 'scheduled';
  mediaCount: number;
}

interface Activity {
  id: number;
  type: 'release_created' | 'distribution_sent' | 'media_published';
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<UserStats>({
    totalReleases: 0,
    totalDistributions: 0,
    totalCredits: 500,
    usedCredits: 0,
    planName: 'Free',
    planLimit: 3,
  });

  const [recentReleases, setRecentReleases] = useState<RecentRelease[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Личный кабинет | PressReach";
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      syncUser();
      fetchDashboardData();
    }
  }, [isLoaded, user]);

  const syncUser = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/user/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Ошибка синхронизации пользователя');
      }
    } catch (error) {
      console.error('Ошибка синхронизации:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();

      // Получаем статистику пользователя
      const response = await fetch(`${API_URL}/api/user/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const data = await response.json();

      setStats({
        totalReleases: data.total_releases || 0,
        totalDistributions: data.total_distributions || 0,
        totalCredits: data.total_credits || 500,
        usedCredits: data.used_credits || 0,
        planName: data.plan_name || 'Free',
        planLimit: data.plan_limit || 3,
        mediaCount: data.media_count || 0,
      });

      // Преобразуем релизы
      const releases = (data.recent_releases || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        createdAt: r.created_at,
        status: r.status as 'draft' | 'sent' | 'scheduled',
        mediaCount: r.media_count || 0,
      }));

      setRecentReleases(releases);

      // Генерируем активности на основе релизов
      const newActivities: Activity[] = releases.slice(0, 3).map((release: RecentRelease, idx: number) => ({
        id: idx + 1,
        type: release.status === 'sent' ? 'distribution_sent' : 'release_created',
        title: release.status === 'sent' ? 'Рассылка отправлена' : 'Новый пресс-релиз',
        description: release.title.substring(0, 50) + '...',
        timestamp: getRelativeTime(release.createdAt),
        icon: release.status === 'sent' ? Send : FileText,
        color: release.status === 'sent' ? 'text-green-500' : 'text-purple-500',
      }));

      setActivities(newActivities);

    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка');

      // Fallback к mock данным при ошибке
      setStats({
        totalReleases: 0,
        totalDistributions: 0,
        totalCredits: 100,
        usedCredits: 0,
        planName: 'Free',
        planLimit: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (dateString: string) => {
    if (!dateString) return 'недавно';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    return date.toLocaleDateString('ru-RU');
  };  const getStatusBadge = (status: RecentRelease['status']) => {
    const statusConfig = {
      draft: { label: 'Черновик', variant: 'secondary' as const, icon: Clock },
      sent: { label: 'Отправлено', variant: 'default' as const, icon: CheckCircle2 },
      scheduled: { label: 'Запланировано', variant: 'outline' as const, icon: Calendar },
      pending: { label: 'Ожидает', variant: 'secondary' as const, icon: Clock },
      processing: { label: 'В обработке', variant: 'outline' as const, icon: Clock },
      completed: { label: 'Завершено', variant: 'default' as const, icon: CheckCircle2 },
      failed: { label: 'Ошибка', variant: 'destructive' as const, icon: Clock },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const creditsPercentage = (stats.usedCredits / stats.totalCredits) * 100;
  const remainingCredits = stats.totalCredits - stats.usedCredits;

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto" />
          <p className="mt-4 text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Привет, {user?.firstName || 'Друг'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Добро пожаловать в ваш личный кабинет PressReach
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Настройки
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {/* Quick Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Пресс-релизов
                  </p>
                  <p className="text-3xl font-bold">{stats.totalReleases}</p>
                  <p className="text-xs text-green-600 mt-1">+3 за неделю</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Отправлено в СМИ
                  </p>
                  <p className="text-3xl font-bold">{stats.totalDistributions}</p>
                  <p className="text-xs text-green-600 mt-1">+24 за неделю</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Send className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    СМИ охвачено
                  </p>
                  <p className="text-3xl font-bold">{stats.mediaCount || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Всего отправок</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Осталось кредитов
                  </p>
                  <p className="text-3xl font-bold">{remainingCredits}</p>
                  <p className="text-xs text-gray-500 mt-1">из {stats.totalCredits}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Releases & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Branding CTA Card */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <CardTitle className="text-purple-900 dark:text-purple-100">
                        Персонализируйте свои рассылки
                      </CardTitle>
                    </div>
                    <CardDescription className="text-purple-700 dark:text-purple-300">
                      Настройте фирменный стиль: логотип, цвета, подпись и соцсети.
                      Ваши письма будут выглядеть профессионально и узнаваемо!
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={() => navigate('/branding')}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Настроить брендинг
                </Button>
              </CardContent>
            </Card>

            {/* Subscription Card */}
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Тариф: {stats.planName}</CardTitle>
                    <CardDescription>
                      Осталось {stats.planLimit - stats.totalReleases} из {stats.planLimit} релизов в этом месяце
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => navigate('/pricing')}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Улучшить
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Использовано кредитов</span>
                    <span className="font-semibold">
                      {stats.usedCredits} / {stats.totalCredits}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${creditsPercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Releases */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Последние пресс-релизы</CardTitle>
                    <CardDescription>Ваши недавние публикации</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => navigate('/generator')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Создать
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReleases.map((release) => (
                    <div
                      key={release.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => navigate(`/releases/${release.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{release.title}</h4>
                          {getStatusBadge(release.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(release.createdAt)}
                          </span>
                          {release.mediaCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {release.mediaCount} СМИ
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
                <CardDescription>Часто используемые функции</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex-col"
                    onClick={() => navigate('/generator')}
                  >
                    <FileText className="w-8 h-8 mb-2" />
                    <span>Создать релиз</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col"
                    onClick={() => navigate('/distribution')}
                  >
                    <Send className="w-8 h-8 mb-2" />
                    <span>Отправить рассылку</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col"
                    onClick={() => navigate('/media-management')}
                  >
                    <Users className="w-8 h-8 mb-2" />
                    <span>База СМИ</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col"
                    onClick={() => navigate('/branding')}
                  >
                    <Palette className="w-8 h-8 mb-2" />
                    <span>Брендинг</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity & Tips */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Последняя активность
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex gap-3">
                        <div className={`mt-1 ${activity.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{activity.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <CardHeader>
                <CardTitle className="text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Совет дня
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-900 dark:text-yellow-300">
                  Персонализируйте каждое письмо! СМИ на 300% чаще открывают релизы с
                  персональным обращением к редактору.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => window.open('/blog/personalization-tips', '_blank')}
                >
                  Узнать больше
                </Button>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card>
              <CardHeader>
                <CardTitle>Нужна помощь?</CardTitle>
                <CardDescription>Мы всегда на связи</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  База знаний
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Связаться с поддержкой
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

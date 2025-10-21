import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Clock, CheckCircle2, XCircle, Calendar } from 'lucide-react';

const API_URL = 'http://localhost:8000';

interface MediaOutlet {
  id: number;
  name: string;
  media_type: string;
  email: string;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
}

interface Distribution {
  id: number;
  press_release_title: string;
  press_release_content: string;
  company_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  created_at: string;
  scheduled_at: string | null;
  total_media_count: number;
  sent_count: number;
  failed_count: number;
  media_outlets: MediaOutlet[];
}

export default function ReleaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [distribution, setDistribution] = useState<Distribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Пресс-релиз #${id} | PressReach`;
  }, [id]);

  useEffect(() => {
    fetchDistribution();
  }, [id]);

  const fetchDistribution = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/distributions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить данные о рассылке');
      }

      const data = await response.json();
      setDistribution(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: any }> = {
      pending: { label: 'Ожидает', variant: 'secondary', icon: Clock },
      processing: { label: 'В обработке', variant: 'outline', icon: Clock },
      completed: { label: 'Завершено', variant: 'default', icon: CheckCircle2 },
      failed: { label: 'Ошибка', variant: 'destructive', icon: XCircle },
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

  const getDeliveryStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      pending: { label: 'Ожидает', variant: 'secondary' },
      sent: { label: 'Отправлено', variant: 'default' },
      delivered: { label: 'Доставлено', variant: 'default' },
      failed: { label: 'Ошибка', variant: 'destructive' },
      bounced: { label: 'Отклонено', variant: 'destructive' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !distribution) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Ошибка загрузки</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Рассылка не найдена'}</p>
                <Button onClick={() => navigate('/dashboard')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Вернуться в кабинет
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад в кабинет
          </Button>
        </div>

        {/* Main Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{distribution.press_release_title}</CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Создано: {formatDate(distribution.created_at)}
                  </span>
                  {distribution.scheduled_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Запланировано: {formatDate(distribution.scheduled_at)}
                    </span>
                  )}
                </CardDescription>
              </div>
              {getStatusBadge(distribution.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Текст пресс-релиза</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg whitespace-pre-wrap">
                  {distribution.press_release_content}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">Компания</h4>
                  <p>{distribution.company_name}</p>
                </div>
                {distribution.contact_email && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">Email для связи</h4>
                    <p>{distribution.contact_email}</p>
                  </div>
                )}
                {distribution.contact_phone && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">Телефон</h4>
                    <p>{distribution.contact_phone}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Всего СМИ</p>
                <p className="text-3xl font-bold">{distribution.total_media_count}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Отправлено</p>
                <p className="text-3xl font-bold text-green-600">{distribution.sent_count}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ошибки</p>
                <p className="text-3xl font-bold text-red-600">{distribution.failed_count}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Media Outlets List */}
        <Card>
          <CardHeader>
            <CardTitle>СМИ в рассылке</CardTitle>
            <CardDescription>
              Список всех медиа-площадок, выбранных для этой рассылки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {distribution.media_outlets && distribution.media_outlets.length > 0 ? (
                distribution.media_outlets.map((media) => (
                  <div
                    key={media.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{media.name}</h4>
                        <Badge variant="outline">{media.media_type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{media.email}</p>
                      {media.sent_at && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Отправлено: {formatDate(media.sent_at)}
                        </p>
                      )}
                    </div>
                    {getDeliveryStatusBadge(media.status)}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Нет данных о СМИ
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

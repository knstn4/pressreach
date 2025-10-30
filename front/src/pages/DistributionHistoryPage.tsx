import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Mail,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '@/config';

interface Distribution {
  id: number;
  press_release_title: string;
  company_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  total_media_count: number;
  sent_count: number;
  failed_count: number;
  total_price: number;
  created_at: string;
  sent_at: string | null;
  scheduled_at: string | null;
}

export default function DistributionHistoryPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    document.title = "История рассылок | PressReach";
    fetchDistributions();
  }, [filter]);

  const fetchDistributions = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const url = filter
        ? `${API_URL}/api/distributions?status=${filter}`
        : `${API_URL}/api/distributions`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки рассылок');
      }

      const data = await response.json();
      setDistributions(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Ошибка загрузки рассылок:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Distribution['status']) => {
    const config = {
      pending: { label: 'Ожидает', icon: Clock, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      processing: { label: 'Отправляется', icon: Send, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      completed: { label: 'Отправлено', icon: CheckCircle2, className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      failed: { label: 'Ошибка', icon: AlertCircle, className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      partial: { label: 'Частично', icon: AlertCircle, className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    };

    const { label, icon: Icon, className } = config[status] || config.pending;

    return (
      <Badge className={className} variant="secondary">
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleViewDistribution = (id: number) => {
    // Можно добавить отдельную страницу просмотра детальной информации
    console.log('View distribution:', id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">История рассылок</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Все ваши отправленные пресс-релизы
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={fetchDistributions}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
              <Button onClick={() => navigate('/distribution')}>
                <Send className="w-4 h-4 mr-2" />
                Новая рассылка
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button
              variant={filter === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(null)}
            >
              Все
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Отправленные
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Ожидают
            </Button>
            <Button
              variant={filter === 'failed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('failed')}
            >
              С ошибками
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Distributions List */}
        {distributions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Пока нет рассылок</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Создайте свою первую рассылку пресс-релиза
              </p>
              <Button onClick={() => navigate('/distribution')}>
                <Send className="w-4 h-4 mr-2" />
                Создать рассылку
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {distributions.map((dist) => (
              <Card
                key={dist.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewDistribution(dist.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">
                          {dist.press_release_title}
                        </h3>
                        {getStatusBadge(dist.status)}
                      </div>

                      {dist.company_name && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {dist.company_name}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>Создано: {formatDate(dist.created_at)}</span>
                        </div>

                        {dist.sent_at && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Send className="w-4 h-4" />
                            <span>Отправлено: {formatDate(dist.sent_at)}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>
                            СМИ: {dist.sent_count}/{dist.total_media_count}
                            {dist.failed_count > 0 && (
                              <span className="text-red-600 ml-1">
                                ({dist.failed_count} ошибок)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {dist.status === 'completed' && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              Успешно отправлено на {dist.sent_count} {dist.sent_count === 1 ? 'СМИ' : 'СМИ'}
                            </span>
                          </div>
                        </div>
                      )}

                      {dist.status === 'partial' && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>
                              Отправлено на {dist.sent_count} из {dist.total_media_count} СМИ
                            </span>
                          </div>
                        </div>
                      )}

                      {dist.status === 'failed' && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>Ошибка отправки на все СМИ</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button variant="ghost" size="icon">
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {distributions.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Всего рассылок
                  </p>
                  <p className="text-3xl font-bold">{distributions.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Отправлено
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {distributions.filter((d) => d.status === 'completed').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Всего СМИ
                  </p>
                  <p className="text-3xl font-bold">
                    {distributions.reduce((sum, d) => sum + d.sent_count, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Ошибок
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {distributions.reduce((sum, d) => sum + d.failed_count, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

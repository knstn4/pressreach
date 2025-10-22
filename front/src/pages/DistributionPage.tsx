import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_URL } from '@/config';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface MediaOutlet {
  id: number;
  name: string;
  media_type: string;
  website: string;
  description: string | null;
  email: string | null;
  telegram_username: string | null;
  audience_size: number;
  monthly_reach: number;
  base_price: number;
  is_premium: boolean;
  rating: number;
  categories: Array<{ id: number; name: string; slug: string }>;
}

interface PriceBreakdown {
  id: number;
  name: string;
  base_price: number;
  priority_multiplier: number;
  is_premium: boolean;
  calculated_price: number;
}

export default function DistributionPage() {
  const location = useLocation();
  const { getToken } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mediaOutlets, setMediaOutlets] = useState<MediaOutlet[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMedia, setSelectedMedia] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown[]>([]);

  // Данные пресс-релиза
  const [pressReleaseTitle, setPressReleaseTitle] = useState('');
  const [pressReleaseContent, setPressReleaseContent] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [distributionCreated, setDistributionCreated] = useState(false);
  const [distributionId, setDistributionId] = useState<number | null>(null);

  // Устанавливаем заголовок страницы
  useEffect(() => {
    document.title = "Рассылка | PressReach";
  }, []);

  // Получаем данные из навигации (если пришли со страницы генератора)
  useEffect(() => {
    const state = location.state as {
      pressReleaseTitle?: string;
      pressReleaseContent?: string;
      companyName?: string;
    } | null;

    if (state) {
      if (state.pressReleaseTitle) setPressReleaseTitle(state.pressReleaseTitle);
      if (state.pressReleaseContent) setPressReleaseContent(state.pressReleaseContent);
      if (state.companyName) setCompanyName(state.companyName);
    }
  }, [location.state]);

  // Загрузка категорий
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
      }
    };

    fetchCategories();
  }, []);

  // Загрузка медиа
  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const url = selectedCategory === 'all'
          ? `${API_URL}/api/media`
          : `${API_URL}/api/media?category_id=${selectedCategory}`;

        const response = await fetch(url);
        const data = await response.json();
        setMediaOutlets(data);
      } catch (error) {
        console.error('Ошибка загрузки медиа:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [selectedCategory]);

  // Расчёт цены при изменении выбора
  useEffect(() => {
    if (selectedMedia.length === 0) {
      setTotalPrice(0);
      setPriceBreakdown([]);
      return;
    }

    const calculatePrice = async () => {
      setCalculating(true);
      try {
        const response = await fetch(`${API_URL}/api/calculate-price`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media_ids: selectedMedia })
        });

        const data = await response.json();
        setTotalPrice(data.total_price);
        setPriceBreakdown(data.breakdown);
      } catch (error) {
        console.error('Ошибка расчёта цены:', error);
      } finally {
        setCalculating(false);
      }
    };

    calculatePrice();
  }, [selectedMedia]);

  const toggleMediaSelection = (mediaId: number) => {
    setSelectedMedia(prev =>
      prev.includes(mediaId)
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMedia.length === mediaOutlets.length) {
      setSelectedMedia([]);
    } else {
      setSelectedMedia(mediaOutlets.map(m => m.id));
    }
  };

  const handleCreateDistribution = async () => {
    if (!pressReleaseTitle || !pressReleaseContent || !companyName || selectedMedia.length === 0) {
      alert('Пожалуйста, заполните все обязательные поля и выберите хотя бы одно СМИ');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/distributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          press_release_title: pressReleaseTitle,
          press_release_content: pressReleaseContent,
          company_name: companyName,
          contact_email: contactEmail || null,
          contact_phone: contactPhone || null,
          media_ids: selectedMedia,
          scheduled_at: null
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка создания рассылки');
      }

      const data = await response.json();
      setDistributionId(data.id);
      setDistributionCreated(true);
    } catch (error) {
      console.error('Ошибка создания рассылки:', error);
      alert('Ошибка создания рассылки');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getMediaTypeIcon = (type: string) => {
    const types: Record<string, string> = {
      online: '🌐',
      newspaper: '📰',
      magazine: '📖',
      tv: '📺',
      radio: '📻',
      agency: '📢',
      blog: '✍️'
    };
    return types[type.toLowerCase()] || '📄';
  };

  if (distributionCreated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Рассылка создана!</CardTitle>
            <CardDescription>
              Ваш пресс-релиз будет отправлен в {selectedMedia.length} {selectedMedia.length === 1 ? 'СМИ' : 'СМИ'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">ID рассылки</p>
              <p className="text-2xl font-bold text-gray-900">#{distributionId}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">Стоимость</p>
              <p className="text-2xl font-bold text-blue-900">{formatPrice(totalPrice)}</p>
            </div>
            <Button
              onClick={() => {
                setDistributionCreated(false);
                setDistributionId(null);
                setPressReleaseTitle('');
                setPressReleaseContent('');
                setSelectedMedia([]);
              }}
              className="w-full"
            >
              Создать новую рассылку
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Рассылка пресс-релиза</h1>
          <p className="text-gray-600">
            Выберите СМИ для рассылки вашего пресс-релиза и рассчитайте стоимость
          </p>
          {location.state && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">
                <strong>Пресс-релиз загружен!</strong> Данные были автоматически заполнены из генератора.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка: Данные пресс-релиза */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Данные пресс-релиза</CardTitle>
                <CardDescription>Заполните информацию о вашем пресс-релизе</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company">Название компании *</Label>
                  <Input
                    id="company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="ООО «Компания»"
                  />
                </div>

                <div>
                  <Label htmlFor="title">Заголовок пресс-релиза *</Label>
                  <Input
                    id="title"
                    value={pressReleaseTitle}
                    onChange={(e) => setPressReleaseTitle(e.target.value)}
                    placeholder="Новый продукт от..."
                  />
                </div>

                <div>
                  <Label htmlFor="content">Текст пресс-релиза *</Label>
                  <Textarea
                    id="content"
                    value={pressReleaseContent}
                    onChange={(e) => setPressReleaseContent(e.target.value)}
                    placeholder="Текст вашего пресс-релиза..."
                    rows={10}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email для связи</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="press@company.ru"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Телефон для связи</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Выбор СМИ */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Выбор СМИ</CardTitle>
                    <CardDescription>
                      Выбрано: {selectedMedia.length} из {mediaOutlets.length}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Все категории" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все категории</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                      disabled={mediaOutlets.length === 0}
                    >
                      {selectedMedia.length === mediaOutlets.length ? 'Снять всё' : 'Выбрать всё'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : mediaOutlets.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Нет доступных СМИ</p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {mediaOutlets.map(media => (
                      <div
                        key={media.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedMedia.includes(media.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleMediaSelection(media.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedMedia.includes(media.id)}
                            onCheckedChange={() => toggleMediaSelection(media.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">{getMediaTypeIcon(media.media_type)}</span>
                              <h3 className="font-semibold text-gray-900">{media.name}</h3>
                              {media.is_premium && (
                                <Badge variant="default" className="bg-yellow-500">Premium</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <span>👥 {(media.audience_size / 1000000).toFixed(1)}M аудитория</span>
                              <span>📊 {(media.monthly_reach / 1000000).toFixed(1)}M охват/мес</span>
                              <span>⭐ {media.rating}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {media.categories.map(cat => (
                                <Badge key={cat.id} variant="outline" className="text-xs">
                                  {cat.name}
                                </Badge>
                              ))}
                            </div>
                            {media.website && (
                              <a
                                href={media.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              >
                                {media.website}
                              </a>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {formatPrice(media.base_price)}
                            </p>
                            <p className="text-xs text-gray-500">базовая цена</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка: Стоимость и отправка */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Итого</CardTitle>
                <CardDescription>Стоимость рассылки</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {calculating ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                      <p className="text-sm opacity-90 mb-1">Общая стоимость</p>
                      <p className="text-4xl font-bold">{formatPrice(totalPrice)}</p>
                      <p className="text-sm opacity-75 mt-2">
                        {selectedMedia.length} {selectedMedia.length === 1 ? 'СМИ' : 'СМИ'}
                      </p>
                    </div>

                    {priceBreakdown.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Детализация:</h4>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {priceBreakdown.map(item => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 flex items-center gap-1">
                                {item.name}
                                {item.is_premium && <span className="text-yellow-500">⭐</span>}
                              </span>
                              <span className="font-semibold">{formatPrice(item.calculated_price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleCreateDistribution}
                      disabled={loading || selectedMedia.length === 0 || !pressReleaseTitle || !pressReleaseContent || !companyName}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Создание...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Создать рассылку
                        </>
                      )}
                    </Button>

                    {selectedMedia.length === 0 && (
                      <p className="text-sm text-center text-gray-500">
                        Выберите хотя бы одно СМИ
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

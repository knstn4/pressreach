import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Loader2,
  Star,
  Users,
  TrendingUp,
  Globe,
  Filter,
  X,
  CheckCircle2,
  Plus,
  Edit,
  Mail,
  Phone,
  Send,
  User,
} from 'lucide-react';
import { API_URL } from '@/config';
import { useAuth, useUser } from '@clerk/clerk-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface MediaOutlet {
  id: number;
  name: string;
  media_type: string;
  website: string;
  description: string | null;
  email: string | null;
  telegram_username: string | null;
  phone: string | null;
  whatsapp: string | null;
  audience_size: number;
  monthly_reach: number;
  is_active: boolean;
  rating: number;
  categories: Category[];
  added_by_name?: string;
  added_at?: string;
}

interface MediaFormData {
  name: string;
  media_type: string;
  website: string;
  description: string;
  email: string;
  telegram_username: string;
  phone: string;
  whatsapp: string;
  audience_size: number;
  monthly_reach: number;
  is_active: boolean;
  rating: number;
  category_ids: number[];
}

export default function MediaManagementPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [mediaOutlets, setMediaOutlets] = useState<MediaOutlet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaOutlet[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('active');

  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaOutlet | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<MediaFormData>({
    name: '',
    media_type: 'online',
    website: '',
    description: '',
    email: '',
    telegram_username: '',
    phone: '',
    whatsapp: '',
    audience_size: 0,
    monthly_reach: 0,
    is_active: true,
    rating: 4.0,
    category_ids: [],
  });

  const mediaTypes = [
    { value: 'online', label: '🌐 Онлайн издание', icon: '🌐' },
    { value: 'newspaper', label: '📰 Газета', icon: '📰' },
    { value: 'magazine', label: '📖 Журнал', icon: '📖' },
    { value: 'tv', label: '📺 Телевидение', icon: '📺' },
    { value: 'radio', label: '📻 Радио', icon: '📻' },
    { value: 'agency', label: '📢 Агентство', icon: '📢' },
    { value: 'blog', label: '✍️ Блог', icon: '✍️' },
  ];

  // Устанавливаем заголовок страницы
  useEffect(() => {
    document.title = "База СМИ | PressReach";
  }, []);

  // Загрузка данных
  useEffect(() => {
    fetchCategories();
    fetchMediaOutlets();
  }, []);

  // Фильтрация
  useEffect(() => {
    if (!mediaOutlets || mediaOutlets.length === 0) {
      setFilteredMedia([]);
      return;
    }

    let filtered = [...mediaOutlets];

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (media) =>
          media.name?.toLowerCase().includes(query) ||
          media.website?.toLowerCase().includes(query) ||
          media.email?.toLowerCase().includes(query)
      );
    }

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((media) =>
        media.categories?.some((cat) => cat.id === parseInt(selectedCategory))
      );
    }

    // Фильтр активности
    if (filterActive === 'active') {
      filtered = filtered.filter((media) => media.is_active === true);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter((media) => media.is_active === false);
    }

    setFilteredMedia(filtered);
  }, [mediaOutlets, searchQuery, selectedCategory, filterActive]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const fetchMediaOutlets = async () => {
    setLoading(true);
    try {
      // Загружаем все СМИ без фильтра по активности
      const response = await fetch(`${API_URL}/api/media`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка ответа API:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Загружено СМИ:', data.length);
      setMediaOutlets(data);
    } catch (error) {
      console.error('Ошибка загрузки СМИ:', error);
      alert(`Ошибка загрузки данных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMedia(null);
    setFormData({
      name: '',
      media_type: 'online',
      website: '',
      description: '',
      email: '',
      telegram_username: '',
      phone: '',
      whatsapp: '',
      audience_size: 0,
      monthly_reach: 0,
      is_active: true,
      rating: 4.0,
      category_ids: [],
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (media: MediaOutlet) => {
    setEditingMedia(media);
    setFormData({
      name: media.name,
      media_type: media.media_type,
      website: media.website || '',
      description: media.description || '',
      email: media.email || '',
      telegram_username: media.telegram_username || '',
      phone: media.phone || '',
      whatsapp: media.whatsapp || '',
      audience_size: media.audience_size || 0,
      monthly_reach: media.monthly_reach || 0,
      is_active: media.is_active,
      rating: media.rating || 4.0,
      category_ids: media.categories.map((cat) => cat.id),
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      alert('Заполните обязательные поля: Название и Email');
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      const url = editingMedia
        ? `${API_URL}/api/media/${editingMedia.id}`
        : `${API_URL}/api/media`;

      const method = editingMedia ? 'PUT' : 'POST';

      // Подготавливаем данные: убираем пустые строки или конвертируем в null
      const cleanedData = {
        ...formData,
        website: formData.website || null,
        description: formData.description || null,
        telegram_username: formData.telegram_username || null,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
      };

      // Получаем имя пользователя
      const userName = user?.firstName || user?.fullName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'User';

      // Кодируем имя пользователя в base64 для передачи в заголовке (HTTP headers могут содержать только ASCII)
      const encodedUserName = btoa(encodeURIComponent(userName));

      // Отправляем данные как JSON
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Name': encodedUserName, // Передаём закодированное имя в заголовке
        },
        body: JSON.stringify(cleanedData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Детали ошибки:', errorData);

        // Форматируем ошибки валидации
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const errors = errorData.detail.map((err: any) =>
            `${err.loc.join('.')}: ${err.msg}`
          ).join('\n');
          throw new Error(`Ошибка валидации:\n${errors}`);
        }

        throw new Error(errorData.detail || 'Ошибка сохранения');
      }

      await fetchMediaOutlets();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert(`Ошибка при сохранении СМИ: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleCategorySelection = (categoryId: number) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter((id) => id !== categoryId)
        : [...prev.category_ids, categoryId],
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setFilterActive('active');
  };

  const getMediaTypeIcon = (type: string) => {
    const item = mediaTypes.find((t) => t.value === type.toLowerCase());
    return item?.icon || '📄';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (filterActive !== 'active' ? 1 : 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">База данных СМИ</h1>
          <p className="text-gray-600">
            Управление контактами и информацией о медиа-изданиях
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Всего СМИ</p>
                  <p className="text-2xl font-bold">{mediaOutlets.length}</p>
                </div>
                <Globe className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Активных</p>
                  <p className="text-2xl font-bold">
                    {mediaOutlets.filter((m) => m.is_active).length}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Категорий</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
                <Filter className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Панель фильтров и поиска */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Поиск и кнопка добавления */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск по названию, сайту..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить СМИ
                </Button>
              </div>

              {/* Фильтры */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterActive} onValueChange={setFilterActive}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="active">Только активные</SelectItem>
                    <SelectItem value="inactive">Только неактивные</SelectItem>
                  </SelectContent>
                </Select>

                {activeFiltersCount > 0 && (
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Сбросить ({activeFiltersCount})
                  </Button>
                )}
              </div>

              {/* Результаты */}
              <div className="text-sm text-gray-600">
                Показано: <strong>{filteredMedia.length}</strong> из{' '}
                <strong>{mediaOutlets.length}</strong> СМИ
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Таблица */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Ничего не найдено</p>
                <Button variant="outline" onClick={clearFilters}>
                  Сбросить фильтры
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Название</TableHead>
                      <TableHead>Контакты</TableHead>
                      <TableHead>Аудитория</TableHead>
                      <TableHead>Рейтинг</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedia.map((media) => (
                      <TableRow key={media.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getMediaTypeIcon(media.media_type)}</span>
                              <span className="font-semibold">{media.name}</span>
                            </div>
                            {media.website && (
                              <a
                                href={media.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Globe className="w-3 h-3" />
                                {media.website.replace(/^https?:\/\//, '')}
                              </a>
                            )}
                            <div className="flex gap-1 flex-wrap">
                              {media.categories.map((cat) => (
                                <Badge key={cat.id} variant="outline" className="text-xs">
                                  {cat.name}
                                </Badge>
                              ))}
                            </div>
                            {media.added_by_name && (
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                Добавил: {media.added_by_name}
                                {media.added_at && ` • ${formatDate(media.added_at)}`}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {media.email && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Mail className="w-3 h-3" />
                                <span className="truncate max-w-[200px]">{media.email}</span>
                              </div>
                            )}
                            {media.phone && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Phone className="w-3 h-3" />
                                {media.phone}
                              </div>
                            )}
                            {media.telegram_username && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Send className="w-3 h-3" />
                                {media.telegram_username}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-gray-500" />
                              <span>{formatNumber(media.audience_size)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-gray-500" />
                              <span>{formatNumber(media.monthly_reach)}/мес</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Цена скрыта */}
                        {/* <TableCell>
                          <div className="font-semibold">{formatPrice(media.base_price)}</div>
                          <div className="text-xs text-gray-500">
                            x{(media.priority_multiplier || 1.0).toFixed(1)}
                          </div>
                        </TableCell> */}

                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{(media.rating || 4.0).toFixed(1)}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          {media.is_active ? (
                            <Badge className="bg-green-500">Активно</Badge>
                          ) : (
                            <Badge variant="secondary">Неактивно</Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(media)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Диалог добавления/редактирования */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMedia ? 'Редактировать СМИ' : 'Добавить новое СМИ'}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о медиа-издании
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Основная информация */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">
                  Название <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: VC.ru"
                />
              </div>

              <div>
                <Label htmlFor="media_type">Тип СМИ</Label>
                <Select
                  value={formData.media_type}
                  onValueChange={(value) => setFormData({ ...formData, media_type: value })}
                >
                  <SelectTrigger id="media_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mediaTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="website">Веб-сайт</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Контакты */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Контактная информация</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="press@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>

                <div>
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input
                    id="telegram"
                    value={formData.telegram_username}
                    onChange={(e) =>
                      setFormData({ ...formData, telegram_username: e.target.value })
                    }
                    placeholder="@username"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>
            </div>

            {/* Статистика */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Статистика</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="audience_size">Размер аудитории</Label>
                  <Input
                    id="audience_size"
                    type="number"
                    value={formData.audience_size}
                    onChange={(e) =>
                      setFormData({ ...formData, audience_size: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="monthly_reach">Месячный охват</Label>
                  <Input
                    id="monthly_reach"
                    type="number"
                    value={formData.monthly_reach}
                    onChange={(e) =>
                      setFormData({ ...formData, monthly_reach: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="rating">Рейтинг (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: parseFloat(e.target.value) || 4.0 })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Категории */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Категории</h4>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category.id}`}
                      checked={formData.category_ids.includes(category.id)}
                      onCheckedChange={() => toggleCategorySelection(category.id)}
                    />
                    <Label
                      htmlFor={`cat-${category.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Настройки */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Настройки</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Активно (доступно для рассылки)
                  </Label>
                </div>
              </div>
            </div>

            {/* Описание */}
            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Дополнительная информация о СМИ..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>Сохранить</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

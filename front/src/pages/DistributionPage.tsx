import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Send, CheckCircle2, Upload, X, FileText, Image, FileArchive, File as FileIcon, Mail } from 'lucide-react';
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
  // Контакты скрыты - пользователи должны использовать нашу рассылку
  // email: string | null;
  // telegram_username: string | null;
  audience_size: number;
  monthly_reach: number;
  // base_price: number; // Скрыто
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

interface UploadedFile {
  id: number;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
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
  const [analyzingText, setAnalyzingText] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Данные пресс-релиза
  const [pressReleaseTitle, setPressReleaseTitle] = useState('');
  const [pressReleaseContent, setPressReleaseContent] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [distributionCreated, setDistributionCreated] = useState(false);
  const [distributionId, setDistributionId] = useState<number | null>(null);

  // Файлы
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Preview и отправка
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);

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

  const handleAutoSelectMedia = async () => {
    if (!pressReleaseContent) {
      alert('Пожалуйста, сначала введите текст пресс-релиза');
      return;
    }

    setAnalyzingText(true);
    try {
      const response = await fetch(`${API_URL}/api/analyze-media-relevance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pressReleaseContent,
          model: 'deepseek'
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка анализа текста');
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);

      // Автоматически выбираем рекомендованные СМИ
      if (data.recommended_media && data.recommended_media.length > 0) {
        const recommendedIds = data.recommended_media.map((m: any) => m.id);
        setSelectedMedia(recommendedIds);

        // Показываем результат анализа
        const categoryNames = data.analysis.selected_categories
          .map((cat: any) => cat.category_name)
          .join(', ');

        alert(
          `Автоматически подобрано ${data.total_media_count} СМИ!\n\n` +
          `Релевантные категории: ${categoryNames}\n\n` +
          `${data.analysis.text_summary}`
        );
      } else {
        alert('Не удалось подобрать релевантные СМИ. Попробуйте выбрать вручную.');
      }
    } catch (error) {
      console.error('Ошибка автоматического подбора СМИ:', error);
      alert('Ошибка при подборе СМИ. Попробуйте выбрать вручную.');
    } finally {
      setAnalyzingText(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Проверка размера (100 MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Файл слишком большой! Максимальный размер: 100 MB');
      return;
    }

    // Если рассылка ещё не создана, сохраняем файл локально (временно)
    if (!distributionId) {
      // Создаём объект URL для предпросмотра
      const tempFile: UploadedFile = {
        id: Date.now(), // временный ID
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        uploaded_at: new Date().toISOString()
      };

      setUploadedFiles(prev => [...prev, tempFile]);

      // Сохраняем файл в памяти для последующей загрузки
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target?.result;
        // Сохраняем в sessionStorage или state
        sessionStorage.setItem(`file_${tempFile.id}`, JSON.stringify({
          name: file.name,
          type: file.type,
          data: fileData
        }));
      };
      reader.readAsDataURL(file);

      event.target.value = '';
      return;
    }

    // Если рассылка уже создана, загружаем файл на сервер
    setUploadingFile(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/distributions/${distributionId}/upload-file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Ошибка загрузки файла');
      }

      const uploadedFile = await response.json();
      setUploadedFiles(prev => [...prev, uploadedFile]);

      // Сброс input
      event.target.value = '';
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      alert(error instanceof Error ? error.message : 'Ошибка загрузки файла');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('Удалить этот файл?')) return;

    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/distributions/${distributionId}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления файла');
      }

      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
      alert('Ошибка удаления файла');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <FileArchive className="w-5 h-5 text-yellow-500" />;
    return <FileIcon className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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

      // Загружаем временные файлы на сервер
      // Временные файлы - это те, которые есть в sessionStorage
      for (const tempFile of uploadedFiles) {
        const fileDataStr = sessionStorage.getItem(`file_${tempFile.id}`);
        if (fileDataStr) {
          try {
            const fileData = JSON.parse(fileDataStr);

            // Конвертируем DataURL обратно в Blob
            const response = await fetch(fileData.data);
            const blob = await response.blob();
            const file = new File([blob], fileData.name, { type: fileData.type });

            // Загружаем на сервер
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await fetch(`${API_URL}/api/distributions/${data.id}/upload-file`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            });

            if (uploadResponse.ok) {
              console.log(`✅ Файл ${file.name} загружен на сервер`);
            } else {
              console.error(`❌ Ошибка загрузки файла ${file.name}`);
            }

            // Удаляем из sessionStorage
            sessionStorage.removeItem(`file_${tempFile.id}`);
          } catch (err) {
            console.error('Ошибка загрузки временного файла:', err);
          }
        }
      }

      // Обновляем список файлов с сервера
      try {
        const filesResponse = await fetch(`${API_URL}/api/distributions/${data.id}/files`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (filesResponse.ok) {
          const files = await filesResponse.json();
          setUploadedFiles(files);
        }
      } catch (err) {
        console.error('Ошибка загрузки файлов:', err);
      }

      setDistributionCreated(true);
      
      // Сразу открываем preview после создания
      setTimeout(() => {
        handleOpenPreview();
      }, 500);
      
    } catch (error) {
      console.error('Ошибка создания рассылки:', error);
      alert('Ошибка создания рассылки');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPreview = async () => {
    if (!distributionId) return;

    setLoadingPreview(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/distributions/${distributionId}/preview`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки preview');
      }

      const data = await response.json();
      setPreviewData(data);
      setShowPreview(true);
    } catch (error) {
      console.error('Ошибка preview:', error);
      alert('Ошибка загрузки предпросмотра');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSendDistribution = async () => {
    if (!distributionId) return;

    setSending(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/distributions/${distributionId}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка отправки рассылки');
      }

      const data = await response.json();
      setSendResult(data);
      setShowPreview(false);
      
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Ошибка отправки рассылки');
    } finally {
      setSending(false);
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

  if (distributionCreated && sendResult) {
    // Показываем результат отправки
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              sendResult.failed_count === 0 ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <CheckCircle2 className={`w-10 h-10 ${
                sendResult.failed_count === 0 ? 'text-green-600' : 'text-yellow-600'
              }`} />
            </div>
            <CardTitle className="text-3xl">
              {sendResult.failed_count === 0 ? '✅ Рассылка отправлена!' : '⚠️ Рассылка отправлена частично'}
            </CardTitle>
            <CardDescription>
              {sendResult.failed_count === 0 
                ? `Ваш пресс-релиз успешно отправлен в ${sendResult.sent_count} СМИ`
                : `Отправлено в ${sendResult.sent_count} из ${sendResult.total_media} СМИ`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Всего СМИ</p>
                <p className="text-2xl font-bold text-blue-900">{sendResult.total_media}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 mb-1">Отправлено</p>
                <p className="text-2xl font-bold text-green-900">{sendResult.sent_count}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 mb-1">Ошибки</p>
                <p className="text-2xl font-bold text-red-900">{sendResult.failed_count}</p>
              </div>
            </div>

            <Button
              onClick={() => {
                setDistributionCreated(false);
                setDistributionId(null);
                setSendResult(null);
                setPressReleaseTitle('');
                setPressReleaseContent('');
                setSelectedMedia([]);
                setUploadedFiles([]);
              }}
              className="w-full"
              size="lg"
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

            {/* Прикрепление файлов - доступно всегда */}
            <Card>
              <CardHeader>
                <CardTitle>Прикреплённые файлы</CardTitle>
                <CardDescription>
                  Добавьте презентации, фото, документы (макс. 100 MB)
                </CardDescription>
              </CardHeader>
                <CardContent className="space-y-4">
                  {/* Кнопка загрузки */}
                  <div className="flex items-center gap-4">
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingFile}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar,.7z,.txt,.csv"
                    />
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        {uploadingFile ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Загрузка...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            <span>Выбрать файл</span>
                          </>
                        )}
                      </div>
                    </Label>
                    <p className="text-sm text-gray-500">
                      Поддерживаются: PDF, Word, Excel, PowerPoint, изображения, архивы
                    </p>
                  </div>

                  {/* Список загруженных файлов */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getFileIcon(file.file_type)}
                            <div>
                              <p className="font-medium text-sm">{file.file_name}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.file_size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadedFiles.length === 0 && !uploadingFile && (
                    <p className="text-center text-gray-400 py-8">
                      Файлы не прикреплены
                    </p>
                  )}
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleAutoSelectMedia}
                      disabled={!pressReleaseContent || analyzingText}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {analyzingText ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Анализ...
                        </>
                      ) : (
                        <>
                          ✨ Автоподбор
                        </>
                      )}
                    </Button>
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
                            {media.description && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {media.description}
                              </p>
                            )}
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

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Предпросмотр письма
            </DialogTitle>
            <DialogDescription>
              Проверьте, как будет выглядеть ваш пресс-релиз в email перед отправкой
            </DialogDescription>
          </DialogHeader>

          {previewData && (
            <div className="space-y-4">
              {/* Мета информация */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">От:</span>
                  <span className="text-sm text-gray-900">{previewData.from_name} &lt;{previewData.from_email}&gt;</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Тема:</span>
                  <span className="text-sm text-gray-900 font-medium">{previewData.subject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Получателей:</span>
                  <span className="text-sm text-gray-900 font-semibold">{previewData.media_count} СМИ</span>
                </div>
                {previewData.attachments && previewData.attachments.length > 0 && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-gray-600">Вложения:</span>
                    <div className="text-right">
                      {previewData.attachments.map((att: any, idx: number) => (
                        <div key={idx} className="text-sm text-gray-700">
                          📎 {att.name} ({(att.size / 1024).toFixed(1)} KB)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Список получателей */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">📬 Получатели ({previewData.media_count})</h4>
                <div className="flex flex-wrap gap-2">
                  {previewData.media_outlets.map((media: any) => (
                    <Badge key={media.id} variant="secondary" className="text-xs">
                      {media.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Preview письма */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b">
                  <p className="text-xs text-gray-600 font-medium">Предпросмотр HTML письма</p>
                </div>
                <div 
                  className="p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: previewData.html_preview }}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              disabled={sending}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSendDistribution}
              disabled={sending}
              className="bg-green-600 hover:bg-green-700"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Подтвердить и отправить
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

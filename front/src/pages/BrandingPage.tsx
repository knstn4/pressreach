import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Save, Palette, Building2, Mail, Share2, FileText, Eye } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = 'http://localhost:8000';

interface Branding {
  id?: number;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  company_name: string;
  company_tagline: string;
  company_description: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  address: string;
  linkedin_url: string;
  twitter_url: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  telegram_url: string;
  email_signature: string;
  default_closing: string;
  email_template_style: string;
  show_logo_in_header: boolean;
  show_social_links: boolean;
  footer_text: string;
}

export default function BrandingPage() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branding, setBranding] = useState<Branding>({
    logo_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#8B5CF6',
    accent_color: '#10B981',
    company_name: '',
    company_tagline: '',
    company_description: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    address: '',
    linkedin_url: '',
    twitter_url: '',
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    telegram_url: '',
    email_signature: '',
    default_closing: 'С уважением',
    email_template_style: 'modern',
    show_logo_in_header: true,
    show_social_links: true,
    footer_text: '',
  });

  useEffect(() => {
    document.title = "Настройки брендинга | PressReach";
  }, []);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/branding`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBranding(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки брендинга:', error);
      toast.error('Не удалось загрузить настройки');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/branding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(branding),
      });

      if (response.ok) {
        toast.success('Настройки успешно сохранены');
      } else {
        toast.error('Ошибка сохранения настроек');
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Ошибка сохранения настроек');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Branding, value: any) => {
    setBranding(prev => ({ ...prev, [field]: value }));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Настройки брендинга</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Настройте внешний вид и персонализацию ваших писем
          </p>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Компания
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Цвета
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Контакты
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Соцсети
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Email
            </TabsTrigger>
          </TabsList>

          {/* Company Tab */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Информация о компании</CardTitle>
                <CardDescription>
                  Основная информация, которая будет использоваться в письмах
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="logo_url">URL логотипа</Label>
                  <Input
                    id="logo_url"
                    value={branding.logo_url}
                    onChange={(e) => handleChange('logo_url', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Загрузите логотип на хостинг и вставьте ссылку
                  </p>
                </div>

                {branding.logo_url && (
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm font-medium mb-2">Предпросмотр логотипа:</p>
                    <img
                      src={branding.logo_url}
                      alt="Logo preview"
                      className="max-h-20 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="company_name">Название компании *</Label>
                  <Input
                    id="company_name"
                    value={branding.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    placeholder="ООО «Ваша Компания»"
                  />
                </div>

                <div>
                  <Label htmlFor="company_tagline">Слоган</Label>
                  <Input
                    id="company_tagline"
                    value={branding.company_tagline}
                    onChange={(e) => handleChange('company_tagline', e.target.value)}
                    placeholder="Мы создаем будущее"
                  />
                </div>

                <div>
                  <Label htmlFor="company_description">Описание компании</Label>
                  <Textarea
                    id="company_description"
                    value={branding.company_description}
                    onChange={(e) => handleChange('company_description', e.target.value)}
                    placeholder="Краткое описание вашей компании..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Адрес</Label>
                  <Input
                    id="address"
                    value={branding.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="г. Москва, ул. Примерная, д. 1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle>Фирменные цвета</CardTitle>
                <CardDescription>
                  Выберите цвета, которые будут использоваться в шаблонах писем
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Основной цвет</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={branding.primary_color}
                        onChange={(e) => handleChange('primary_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={branding.primary_color}
                        onChange={(e) => handleChange('primary_color', e.target.value)}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Дополнительный цвет</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={branding.secondary_color}
                        onChange={(e) => handleChange('secondary_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={branding.secondary_color}
                        onChange={(e) => handleChange('secondary_color', e.target.value)}
                        placeholder="#8B5CF6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent_color">Акцентный цвет</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent_color"
                        type="color"
                        value={branding.accent_color}
                        onChange={(e) => handleChange('accent_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={branding.accent_color}
                        onChange={(e) => handleChange('accent_color', e.target.value)}
                        placeholder="#10B981"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="p-6 border rounded-lg" style={{
                  background: `linear-gradient(135deg, ${branding.primary_color}22, ${branding.secondary_color}22)`,
                  borderColor: branding.primary_color
                }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: branding.primary_color }}>
                    Предпросмотр цветовой схемы
                  </h3>
                  <div className="flex gap-2">
                    <div
                      className="px-4 py-2 rounded text-white font-medium"
                      style={{ backgroundColor: branding.primary_color }}
                    >
                      Основной
                    </div>
                    <div
                      className="px-4 py-2 rounded text-white font-medium"
                      style={{ backgroundColor: branding.secondary_color }}
                    >
                      Дополнительный
                    </div>
                    <div
                      className="px-4 py-2 rounded text-white font-medium"
                      style={{ backgroundColor: branding.accent_color }}
                    >
                      Акцент
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Контактная информация</CardTitle>
                <CardDescription>
                  Данные для связи, которые будут указаны в письмах
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contact_person">Контактное лицо</Label>
                  <Input
                    id="contact_person"
                    value={branding.contact_person}
                    onChange={(e) => handleChange('contact_person', e.target.value)}
                    placeholder="Иван Иванов"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_email">Email для связи *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={branding.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_phone">Телефон</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={branding.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Веб-сайт</Label>
                  <Input
                    id="website"
                    type="url"
                    value={branding.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://company.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Социальные сети</CardTitle>
                <CardDescription>
                  Ссылки на профили в социальных сетях
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="linkedin_url">LinkedIn</Label>
                  <Input
                    id="linkedin_url"
                    value={branding.linkedin_url}
                    onChange={(e) => handleChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>

                <div>
                  <Label htmlFor="twitter_url">Twitter / X</Label>
                  <Input
                    id="twitter_url"
                    value={branding.twitter_url}
                    onChange={(e) => handleChange('twitter_url', e.target.value)}
                    placeholder="https://x.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="facebook_url">Facebook</Label>
                  <Input
                    id="facebook_url"
                    value={branding.facebook_url}
                    onChange={(e) => handleChange('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="instagram_url">Instagram</Label>
                  <Input
                    id="instagram_url"
                    value={branding.instagram_url}
                    onChange={(e) => handleChange('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="youtube_url">YouTube</Label>
                  <Input
                    id="youtube_url"
                    value={branding.youtube_url}
                    onChange={(e) => handleChange('youtube_url', e.target.value)}
                    placeholder="https://youtube.com/@..."
                  />
                </div>

                <div>
                  <Label htmlFor="telegram_url">Telegram</Label>
                  <Input
                    id="telegram_url"
                    value={branding.telegram_url}
                    onChange={(e) => handleChange('telegram_url', e.target.value)}
                    placeholder="https://t.me/..."
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Показывать ссылки на соцсети</Label>
                    <p className="text-sm text-gray-500">
                      Отображать иконки соцсетей в подписи email
                    </p>
                  </div>
                  <Switch
                    checked={branding.show_social_links}
                    onCheckedChange={(checked: boolean) => handleChange('show_social_links', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Настройки email</CardTitle>
                <CardDescription>
                  Персонализация шаблона письма и подписи
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Показывать логотип в шапке</Label>
                    <p className="text-sm text-gray-500">
                      Отображать ваш логотип в верхней части письма
                    </p>
                  </div>
                  <Switch
                    checked={branding.show_logo_in_header}
                    onCheckedChange={(checked: boolean) => handleChange('show_logo_in_header', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="default_closing">Заключительная фраза</Label>
                  <Input
                    id="default_closing"
                    value={branding.default_closing}
                    onChange={(e) => handleChange('default_closing', e.target.value)}
                    placeholder="С уважением"
                  />
                </div>

                <div>
                  <Label htmlFor="email_signature">Подпись (HTML)</Label>
                  <Textarea
                    id="email_signature"
                    value={branding.email_signature}
                    onChange={(e) => handleChange('email_signature', e.target.value)}
                    placeholder="<b>Ваше имя</b><br>Должность<br>Компания"
                    rows={6}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Можно использовать HTML теги для форматирования
                  </p>
                </div>

                <div>
                  <Label htmlFor="footer_text">Текст футера</Label>
                  <Textarea
                    id="footer_text"
                    value={branding.footer_text}
                    onChange={(e) => handleChange('footer_text', e.target.value)}
                    placeholder="Дополнительная информация в конце письма..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="mt-6 flex justify-between items-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg">
                <Eye className="w-4 h-4 mr-2" />
                Предпросмотр email
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Предпросмотр email с вашим брендингом</DialogTitle>
                <DialogDescription>
                  Так будет выглядеть ваш пресс-релиз при рассылке
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <EmailPreview branding={branding} />
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="min-w-[200px]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Сохранить настройки
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Компонент предпросмотра email
function EmailPreview({ branding }: { branding: Branding }) {
  const { getToken } = useAuth();
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreview();
  }, [branding]);

  const fetchPreview = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/branding/preview-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          press_release_title: 'Демонстрация вашего email',
          press_release_content: `Это пример того, как будет выглядеть ваш пресс-релиз с применением настроек брендинга.\n\nВаши фирменные цвета, логотип и контактная информация будут автоматически применены ко всем рассылкам.\n\nПолучатели увидят профессионально оформленное письмо, которое отражает стиль вашей компании.`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setHtml(data.html);
      }
    } catch (error) {
      console.error('Ошибка загрузки предпросмотра:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <iframe
        srcDoc={html}
        className="w-full h-[600px]"
        title="Email Preview"
        sandbox="allow-same-origin"
      />
    </div>
  );
}
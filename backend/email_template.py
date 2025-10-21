"""
Генерация персонализированных HTML email-шаблонов
"""

def generate_email_html(
    press_release_title: str,
    press_release_content: str,
    branding: dict = None,
    recipient_name: str = None
) -> str:
    """
    Генерирует HTML письма с брендингом пользователя

    Args:
        press_release_title: Заголовок пресс-релиза
        press_release_content: Текст пресс-релиза
        branding: Настройки брендинга пользователя
        recipient_name: Имя получателя

    Returns:
        HTML код письма
    """

    # Значения по умолчанию
    if not branding:
        branding = {
            'primary_color': '#3B82F6',
            'secondary_color': '#8B5CF6',
            'accent_color': '#10B981',
            'company_name': 'Компания',
            'contact_email': '',
            'default_closing': 'С уважением',
            'show_logo_in_header': True,
            'show_social_links': True,
            'logo_url': None,
            'website': None,
            'contact_person': None,
            'email_signature': None,
            'footer_text': None,
        }

    # Формируем приветствие
    greeting = f"Здравствуйте, {recipient_name}!" if recipient_name else "Здравствуйте!"

    # Логотип в шапке
    logo_html = ""
    if branding.get('show_logo_in_header') and branding.get('logo_url'):
        logo_html = f"""
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="{branding['logo_url']}" alt="{branding.get('company_name', '')}" style="max-height: 60px; max-width: 200px;">
        </div>
        """

    # Социальные сети
    social_links_html = ""
    if branding.get('show_social_links'):
        social_icons = []

        social_networks = {
            'linkedin_url': ('LinkedIn', '#0A66C2'),
            'twitter_url': ('Twitter', '#1DA1F2'),
            'facebook_url': ('Facebook', '#1877F2'),
            'instagram_url': ('Instagram', '#E4405F'),
            'youtube_url': ('YouTube', '#FF0000'),
            'telegram_url': ('Telegram', '#0088CC'),
        }

        for key, (name, color) in social_networks.items():
            if branding.get(key):
                social_icons.append(f"""
                <a href="{branding[key]}" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                    <span style="display: inline-block; width: 32px; height: 32px; background-color: {color}; color: white; text-align: center; line-height: 32px; border-radius: 50%; font-size: 14px; font-weight: bold;">
                        {name[0]}
                    </span>
                </a>
                """)

        if social_icons:
            social_links_html = f"""
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                {''.join(social_icons)}
            </div>
            """

    # Подпись
    signature_html = ""
    if branding.get('email_signature'):
        signature_html = f"""
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid {branding['primary_color']};">
            {branding['email_signature']}
        </div>
        """
    elif branding.get('contact_person') or branding.get('company_name'):
        contact_person = branding.get('contact_person', '')
        company_name = branding.get('company_name', '')
        contact_email = branding.get('contact_email', '')
        contact_phone = branding.get('contact_phone', '')
        website = branding.get('website', '')

        signature_html = f"""
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid {branding['primary_color']};">
            <p style="margin: 5px 0; font-weight: bold; color: {branding['primary_color']};">{contact_person}</p>
            <p style="margin: 5px 0; color: #6b7280;">{company_name}</p>
            {f'<p style="margin: 5px 0; color: #6b7280;">Email: <a href="mailto:{contact_email}" style="color: {branding["primary_color"]};">{contact_email}</a></p>' if contact_email else ''}
            {f'<p style="margin: 5px 0; color: #6b7280;">Тел: {contact_phone}</p>' if contact_phone else ''}
            {f'<p style="margin: 5px 0;"><a href="{website}" style="color: {branding["primary_color"]};">{website}</a></p>' if website else ''}
        </div>
        """

    # Футер
    footer_html = ""
    if branding.get('footer_text'):
        footer_html = f"""
        <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 8px; font-size: 12px; color: #6b7280; text-align: center;">
            {branding['footer_text']}
        </div>
        """

    # Формируем полный HTML
    html = f"""
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{press_release_title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

        <!-- Шапка с градиентом -->
        <div style="background: linear-gradient(135deg, {branding['primary_color']} 0%, {branding['secondary_color']} 100%); padding: 30px; text-align: center;">
            {logo_html}
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: bold;">{branding.get('company_name', 'Пресс-релиз')}</h1>
        </div>

        <!-- Основной контент -->
        <div style="padding: 40px 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">{greeting}</p>

            <h2 style="color: {branding['primary_color']}; font-size: 22px; font-weight: bold; margin: 20px 0 15px 0; line-height: 1.3;">
                {press_release_title}
            </h2>

            <div style="color: #4b5563; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">
                {press_release_content}
            </div>

            <!-- Заключение -->
            <p style="margin-top: 30px; color: #374151; font-size: 16px;">
                {branding.get('default_closing', 'С уважением')},
            </p>

            {signature_html}

            {social_links_html}
        </div>

        <!-- Футер -->
        {footer_html}

        <div style="padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; background-color: #f9fafb;">
            <p style="margin: 5px 0;">Это автоматически сгенерированное письмо. Пожалуйста, не отвечайте на него.</p>
            <p style="margin: 5px 0;">© {branding.get('company_name', '')} - Создано с помощью PressReach</p>
        </div>
    </div>
</body>
</html>
    """

    return html.strip()


def generate_plain_text_email(
    press_release_title: str,
    press_release_content: str,
    branding: dict = None,
    recipient_name: str = None
) -> str:
    """
    Генерирует plain text версию письма (для email клиентов без HTML)
    """

    if not branding:
        branding = {
            'company_name': 'Компания',
            'contact_email': '',
            'default_closing': 'С уважением',
            'contact_person': None,
            'contact_phone': None,
            'website': None,
        }

    greeting = f"Здравствуйте, {recipient_name}!" if recipient_name else "Здравствуйте!"

    text = f"""
{greeting}

{press_release_title}
{'=' * len(press_release_title)}

{press_release_content}

{branding.get('default_closing', 'С уважением')},

{branding.get('contact_person', '')}
{branding.get('company_name', '')}
"""

    if branding.get('contact_email'):
        text += f"\nEmail: {branding['contact_email']}"
    if branding.get('contact_phone'):
        text += f"\nТел: {branding['contact_phone']}"
    if branding.get('website'):
        text += f"\nВеб-сайт: {branding['website']}"

    text += "\n\n---\nЭто автоматически сгенерированное письмо.\n© " + branding.get('company_name', '') + " - Создано с помощью PressReach"

    return text.strip()

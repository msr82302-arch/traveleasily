from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'service': 'EasyTravels Django Backend Engine',
        'version': '2.4.0',
        'database': settings.DATABASES['default']['ENGINE'].split('.')[-1],
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/applications/', include('applications.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

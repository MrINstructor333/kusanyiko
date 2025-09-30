from django.urls import path
from .views import MemberListCreateView, MemberDetailView, export_members, public_member_search

urlpatterns = [
    path('', MemberListCreateView.as_view(), name='member-list-create'),
    path('search/', public_member_search, name='public-member-search'),
    path('export/', export_members, name='member-export'),
    path('<int:pk>/', MemberDetailView.as_view(), name='member-detail'),
]

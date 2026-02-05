from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Poll, Option, Vote
from .serializers import PollSerializer, VoteSerializer
from django.db.models import Count
from django.utils import timezone

class PollViewSet(viewsets.ModelViewSet):
    queryset = Poll.objects.all()
    serializer_class = PollSerializer

    @action(detail=True, methods=['POST'])
    def vote(self, request, pk=None):
        poll = self.get_object()
        option_id = request.data.get('option_id')
        user_ip = request.META.get('REMOTE_ADDR')

        if Vote.objects.filter(poll=poll, user_ip=user_ip).exists():
            return Response({'error': 'You have already voted'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            option = poll.options.get(id=option_id)
        except Option.DoesNotExist:
            return Response({'error': 'Invalid option'}, status=status.HTTP_400_BAD_REQUEST)

        Vote.objects.create(poll=poll, option=option, user_ip=user_ip)
        return Response({'message': 'Vote counted'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['GET'])
    def results(self, request, pk=None):
        poll = self.get_object()
        results = poll.options.annotate(vote_count=Count('votes')).values('id', 'text', 'vote_count')
        return Response(results)


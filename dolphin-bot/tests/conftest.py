"""Pytest Configuration"""
import pytest
import sys
import os

# Füge backend zum Path hinzu
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# asyncio mode für pytest-asyncio
pytest_plugins = ('pytest_asyncio',)

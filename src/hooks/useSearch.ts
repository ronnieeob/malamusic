import { useState, useCallback, useEffect } from 'react';
import { SearchResults } from '../services/api/searchService';
import { SpotifyService } from '../services/spotify';
import { useDebounce } from './useDebounce';

export function useSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResults>({ songs: [], bands: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'all' | 'songs' | 'bands'>('all');
  const spotifyService = new SpotifyService();

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('metal_aloud_search_history') || '[]');
    } catch {
      return [];
    }
  });

  // Save search history to localStorage
  const saveSearchHistory = useCallback((history: string[]) => {
    try {
      localStorage.setItem('metal_aloud_search_history', JSON.stringify(history));
    } catch (err) {
      console.warn('Failed to save search history:', err);
    }
  }, []);

  useEffect(() => {
    // Reset results and clear error when query is empty
    if (!query.trim()) {
      setResults({ songs: [], bands: [] });
      setError(null);
      return;
    }
    // Just clear error when query changes
    setError(null);
  }, [query]);

  const performSearch = useCallback(async () => {
    const trimmedQuery = debouncedQuery.trim();
    
    if (!trimmedQuery) {
      setResults({ songs: [], bands: [] });
      setError(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const searchResults = await spotifyService.search(trimmedQuery, { type: searchType });
      setResults(searchResults);
      
      // Update search history
      if (trimmedQuery.length >= 3) {
        const newHistory = [
          trimmedQuery,
          ...searchHistory.filter(h => h !== trimmedQuery)
        ].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem('metal_aloud_search_history', JSON.stringify(newHistory));
      }

    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to perform search. Please try again.');
      setResults({ songs: [], bands: [] });
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, searchType, searchHistory]);

  return {
    query,
    setQuery,
    results,
    searchType,
    setSearchType,
    loading,
    error,
    searchHistory,
    search: () => performSearch()
  };
}
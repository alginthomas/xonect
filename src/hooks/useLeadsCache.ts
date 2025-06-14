
import { useState, useEffect } from 'react';

// Cache keys for localStorage
const CACHE_KEYS = {
  SEARCH_TERM: 'leads_search_term',
  STATUS_FILTER: 'leads_status_filter',
  CATEGORY_FILTER: 'leads_category_filter',
  DATA_AVAILABILITY_FILTER: 'leads_data_availability_filter',
  COUNTRY_FILTER: 'leads_country_filter',
  SORT_FIELD: 'leads_sort_field',
  SORT_DIRECTION: 'leads_sort_direction',
  CURRENT_PAGE: 'leads_current_page',
  ITEMS_PER_PAGE: 'leads_items_per_page',
  NAVIGATION_FILTER: 'leads_navigation_filter'
};

// Cache utilities
const saveToCache = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to cache:', error);
  }
};

const loadFromCache = (key: string, defaultValue: any) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached === null || cached === 'undefined') {
      return defaultValue;
    }
    return JSON.parse(cached);
  } catch (error) {
    console.warn('Failed to load from cache:', error);
    return defaultValue;
  }
};

export const useLeadsCache = () => {
  const [searchTerm, setSearchTerm] = useState(() => loadFromCache(CACHE_KEYS.SEARCH_TERM, ''));
  const [statusFilter, setStatusFilter] = useState<string>(() => loadFromCache(CACHE_KEYS.STATUS_FILTER, 'all'));
  const [categoryFilter, setCategoryFilter] = useState<string>(() => loadFromCache(CACHE_KEYS.CATEGORY_FILTER, 'all'));
  const [dataAvailabilityFilter, setDataAvailabilityFilter] = useState<string>(() => loadFromCache(CACHE_KEYS.DATA_AVAILABILITY_FILTER, 'all'));
  const [countryFilter, setCountryFilter] = useState<string>(() => loadFromCache(CACHE_KEYS.COUNTRY_FILTER, 'all'));
  const [sortField, setSortField] = useState<string>(() => loadFromCache(CACHE_KEYS.SORT_FIELD, 'createdAt'));
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => loadFromCache(CACHE_KEYS.SORT_DIRECTION, 'desc'));
  const [currentPage, setCurrentPage] = useState(() => loadFromCache(CACHE_KEYS.CURRENT_PAGE, 1));
  const [itemsPerPage, setItemsPerPage] = useState(() => loadFromCache(CACHE_KEYS.ITEMS_PER_PAGE, 25));
  const [navigationFilter, setNavigationFilter] = useState<{ status?: string; [key: string]: any } | undefined>(() => loadFromCache(CACHE_KEYS.NAVIGATION_FILTER, undefined));

  // Cache state changes
  useEffect(() => {
    saveToCache(CACHE_KEYS.SEARCH_TERM, searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    saveToCache(CACHE_KEYS.STATUS_FILTER, statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    saveToCache(CACHE_KEYS.CATEGORY_FILTER, categoryFilter);
  }, [categoryFilter]);

  useEffect(() => {
    saveToCache(CACHE_KEYS.DATA_AVAILABILITY_FILTER, dataAvailabilityFilter);
  }, [dataAvailabilityFilter]);

  useEffect(() => {
    saveToCache(CACHE_KEYS.COUNTRY_FILTER, countryFilter);
  }, [countryFilter]);

  useEffect(() => {
    saveToCache(CACHE_KEYS.SORT_FIELD, sortField);
  }, [sortField]);

  useEffect(() => {
    saveToCache(CACHE_KEYS.SORT_DIRECTION, sortDirection);
  }, [sortDirection]);

  useEffect(() => {
    saveToCache(CACHE_KEYS.CURRENT_PAGE, currentPage);
  }, [currentPage]);

  useEffect(() => {
    saveToCache(CACHE_KEYS.ITEMS_PER_PAGE, itemsPerPage);
  }, [itemsPerPage]);

  useEffect(() => {
    saveToCache(CACHE_KEYS.NAVIGATION_FILTER, navigationFilter);
  }, [navigationFilter]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    dataAvailabilityFilter,
    setDataAvailabilityFilter,
    countryFilter,
    setCountryFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    navigationFilter,
    setNavigationFilter
  };
};

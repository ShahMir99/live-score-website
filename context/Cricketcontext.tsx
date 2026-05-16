"use client"

import type { Match, Tournament } from '@/hooks/useCricketdata';
import React, { createContext, useContext, useReducer, useCallback } from 'react';


interface CricketState {
  tournaments: Tournament[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  selectedMatch: Match | null;
  filters: {
    status: 'ALL' | 'LIVE' | 'UPCOMING' | 'COMPLETED';
    tournament: string | null;
    format: string | null;
  };
}

type CricketAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TOURNAMENTS'; payload: Tournament[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_MATCH'; payload: Match | null }
  | { type: 'SET_STATUS_FILTER'; payload: 'ALL' | 'LIVE' | 'UPCOMING' | 'COMPLETED' }
  | { type: 'SET_TOURNAMENT_FILTER'; payload: string | null }
  | { type: 'SET_FORMAT_FILTER'; payload: string | null }
  | { type: 'UPDATE_LAST_REFRESHED' }
  | { type: 'RESET_FILTERS' };

const initialState: CricketState = {
  tournaments: [],
  loading: false,
  error: null,
  lastUpdated: null,
  selectedMatch: null,
  filters: {
    status: 'ALL',
    tournament: null,
    format: null,
  },
};

const cricketReducer = (state: CricketState, action: CricketAction): CricketState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TOURNAMENTS':
      return { ...state, tournaments: action.payload, lastUpdated: new Date() };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SELECTED_MATCH':
      return { ...state, selectedMatch: action.payload };
    case 'SET_STATUS_FILTER':
      return { ...state, filters: { ...state.filters, status: action.payload } };
    case 'SET_TOURNAMENT_FILTER':
      return { ...state, filters: { ...state.filters, tournament: action.payload } };
    case 'SET_FORMAT_FILTER':
      return { ...state, filters: { ...state.filters, format: action.payload } };
    case 'UPDATE_LAST_REFRESHED':
      return { ...state, lastUpdated: new Date() };
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: { status: 'ALL', tournament: null, format: null },
      };
    default:
      return state;
  }
};

interface CricketContextType {
  state: CricketState;
  dispatch: React.Dispatch<CricketAction>;
  // Helper methods
  setLoading: (loading: boolean) => void;
  setTournaments: (tournaments: Tournament[]) => void;
  setError: (error: string | null) => void;
  selectMatch: (match: Match | null) => void;
  filterByStatus: (status: 'ALL' | 'LIVE' | 'UPCOMING' | 'COMPLETED') => void;
  filterByTournament: (tournament: string | null) => void;
  filterByFormat: (format: string | null) => void;
  resetFilters: () => void;
  getFilteredMatches: () => Match[];
  getAllTournaments: () => string[];
  getAllFormats: () => string[];
  getLiveMatchCount: () => number;
  getUpcomingMatchCount: () => number;
}

const CricketContext = createContext<CricketContextType | undefined>(undefined);

export const CricketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cricketReducer, initialState);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setTournaments = useCallback((tournaments: Tournament[]) => {
    dispatch({ type: 'SET_TOURNAMENTS', payload: tournaments });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const selectMatch = useCallback((match: Match | null) => {
    dispatch({ type: 'SET_SELECTED_MATCH', payload: match });
  }, []);

  const filterByStatus = useCallback((status: 'ALL' | 'LIVE' | 'UPCOMING' | 'COMPLETED') => {
    dispatch({ type: 'SET_STATUS_FILTER', payload: status });
  }, []);

  const filterByTournament = useCallback((tournament: string | null) => {
    dispatch({ type: 'SET_TOURNAMENT_FILTER', payload: tournament });
  }, []);

  const filterByFormat = useCallback((format: string | null) => {
    dispatch({ type: 'SET_FORMAT_FILTER', payload: format });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const getFilteredMatches = useCallback(() => {
    let matches: Match[] = [];

    // Get all matches from tournaments
    state.tournaments.forEach((tournament) => {
      matches = matches.concat(tournament.matches);
    });

    // Apply status filter
    if (state.filters.status !== 'ALL') {
      matches = matches.filter((m) => m.status === state.filters.status);
    }

    // Apply tournament filter
    if (state.filters.tournament) {
      matches = matches.filter((m) => m.competition === state.filters.tournament);
    }

    // Apply format filter
    if (state.filters.format) {
      matches = matches.filter((m) => m.format === state.filters.format);
    }

    return matches;
  }, [state.tournaments, state.filters]);

  const getAllTournaments = useCallback(() => {
    const tournaments = new Set<string>();
    state.tournaments.forEach((t) => tournaments.add(t.name));
    return Array.from(tournaments);
  }, [state.tournaments]);

  const getAllFormats = useCallback(() => {
    const formats = new Set<string>();
    state.tournaments.forEach((t) => {
      t.matches.forEach((m) => formats.add(m.format));
    });
    return Array.from(formats);
  }, [state.tournaments]);

  const getLiveMatchCount = useCallback(() => {
    return state.tournaments.reduce((count, t) => {
      return count + t.matches.filter((m) => m.status === 'LIVE').length;
    }, 0);
  }, [state.tournaments]);

  const getUpcomingMatchCount = useCallback(() => {
    return state.tournaments.reduce((count, t) => {
      return count + t.matches.filter((m) => m.status === 'UPCOMING').length;
    }, 0);
  }, [state.tournaments]);

  const value: CricketContextType = {
    state,
    dispatch,
    setLoading,
    setTournaments,
    setError,
    selectMatch,
    filterByStatus,
    filterByTournament,
    filterByFormat,
    resetFilters,
    getFilteredMatches,
    getAllTournaments,
    getAllFormats,
    getLiveMatchCount,
    getUpcomingMatchCount,
  };

  return (
    <CricketContext.Provider value={value}>
      {children}
    </CricketContext.Provider>
  );
};

export const useCricketContext = (): CricketContextType => {
  const context = useContext(CricketContext);
  if (!context) {
    throw new Error('useCricketContext must be used within CricketProvider');
  }
  return context;
};
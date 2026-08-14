import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchFamilyRecommendations } from '../services/familyService';
import { fetchFamilyWatchlist } from '../services/watchlistService';
import MovieGrid from '../components/MovieGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Sparkles, ThumbsUp } from 'lucide-react';
import './RecommendationsPage.css';

const RecommendationsPage = () => {
  const { activeFamilyId, family } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [watchlistMap, setWatchlistMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecommendations = async () => {
    if (!activeFamilyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetchFamilyRecommendations(activeFamilyId);
      if (res.success) {
        setRecommendations(res.recommendations);
      }

      const watchRes = await fetchFamilyWatchlist(activeFamilyId);
      if (watchRes.success) {
        const map = {};
        watchRes.data.forEach((item) => {
          if (item.movieId) map[item.movieId._id] = item;
        });
        setWatchlistMap(map);
      }
    } catch (err) {
      setError(err.message || 'Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [activeFamilyId]);

  if (loading) {
    return <LoadingSpinner text="Generating smart recommendations for your family..." />;
  }

  return (
    <div className="recommendations-page animate-fade-in">
      <div className="recommendations-header">
        <div className="recs-pill">
          <Sparkles size={14} />
          <span>Tailored AI & Genre Matching</span>
        </div>
        <h1 className="recommendations-title">Recommended Movies for {family?.name || 'Your Family'}</h1>
        <p className="recommendations-subtitle">
          Based on your family's favorite genres, ratings, and watch history. Automatically filters out movies you've already watched or saved!
        </p>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={loadRecommendations} />
      ) : (
        <MovieGrid
          movies={recommendations}
          loading={false}
          emptyMessage="No new recommendations available right now. Check back after reviewing more movies!"
          watchlistMap={watchlistMap}
          onWatchlistChange={loadRecommendations}
        />
      )}
    </div>
  );
};

export default RecommendationsPage;

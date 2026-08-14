import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Users, BookmarkCheck, Star, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge badge-role-parent hero-pill">
            <Sparkles size={14} />
            <span>Family Movie Night Made Simple</span>
          </div>

          <h1 className="hero-title">
            Discover, Track & Enjoy <br />
            <span className="hero-gradient-text">Movies Together as a Family</span>
          </h1>

          <p className="hero-subtitle">
            Create your family workspace, curate a shared movie watchlist, track watch status, rate films, and read reviews from your loved ones.
          </p>

          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                <span>Go to Family Dashboard</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  <span>Start Family Watchlist</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="hero-backdrop-preview">
          <img
            src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80"
            alt="Family movie night"
            className="hero-img"
          />
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="features-section">
        <h2 className="section-title">Everything Your Family Needs</h2>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon icon-red">
              <BookmarkCheck size={28} />
            </div>
            <h3>Shared Family Watchlist</h3>
            <p>Maintain a single synchronized watchlist across all family devices. Organize by priority and watch status.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-blue">
              <Users size={28} />
            </div>
            <h3>Parent & Child Roles</h3>
            <p>Parents manage family members and movie additions, while kids can browse, add to watchlist, and write reviews.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-green">
              <Star size={28} />
            </div>
            <h3>Ratings & Reviews</h3>
            <p>Share ratings and reviews within your family circle to see what everyone thought after movie night.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-purple">
              <Sparkles size={28} />
            </div>
            <h3>Smart Recommendations</h3>
            <p>Receive personalized movie recommendations tailored to your family's favorite genres and rating history.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

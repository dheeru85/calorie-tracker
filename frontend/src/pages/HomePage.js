import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Target, Zap, BarChart3, Search, Users, Shield } from 'lucide-react';

const HomePage = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Search,
      title: 'Smart Food Search',
      description: 'Access thousands of foods with detailed nutrition information from USDA database',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set and track your calorie and macro goals with personalized recommendations',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Visualize your nutrition journey with beautiful charts and insights',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Quick Logging',
      description: 'Log meals in seconds with our intuitive and fast food diary',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Join thousands of users on their health and fitness journey',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is secure and private. We never share your personal information',
      color: 'from-red-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-3xl mx-4"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl mx-auto mb-8 flex items-center justify-center animate-bounce-gentle">
            <Target className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            <span className="gradient-text">Track Your Nutrition</span>
            <br />
            <span className="text-gray-700">Live Your Best Life</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in">
            Transform your health journey with our vibrant, user-friendly calorie tracker. 
            Get personalized insights, track your progress, and achieve your goals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-lg px-8 py-4">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-8 py-4">
                  Start Your Journey
                </Link>
                <Link to="/login" className="btn-outline text-lg px-8 py-4">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Powerful Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed on your nutrition journey, beautifully designed and easy to use.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-vibrant hover:scale-105 transition-transform duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Join the Community</h2>
          <p className="text-xl mb-12 text-white/90">
            Thousands of users have already transformed their lives with FitTracker
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center animate-fade-in">
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-xl text-white/80">Active Users</div>
            </div>
            <div className="text-center animate-fade-in">
              <div className="text-5xl font-bold mb-2">1M+</div>
              <div className="text-xl text-white/80">Foods Tracked</div>
            </div>
            <div className="text-center animate-fade-in">
              <div className="text-5xl font-bold mb-2">99%</div>
              <div className="text-xl text-white/80">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your <span className="gradient-text">Health Journey?</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who have already transformed their lives with FitTracker. 
            Start tracking your nutrition today and see the difference.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Get Started Free
              </Link>
              <Link to="/login" className="btn-outline text-lg px-8 py-4">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { WorkerProfile, Service } from '../types/index.ts';
import {
  Search,
  Filter,
  Star,
  MapPin,
  CheckCircle,
  Home,
  Building2,
  Calendar,
  Languages,
  Award,
  ChevronRight,
  SlidersHorizontal,
  Compass,
  ArrowUpDown,
} from 'lucide-react';

export const WorkerDiscovery: React.FC = () => {
  const {
    services,
    serviceAreas,
    settings,
    openBookingModal,
    navigateTo,
    viewParams,
    selectedCity,
    setSelectedCity,
    selectedArea,
    setSelectedArea,
    lang,
    t,
  } = useApp();

  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(viewParams.serviceId || 'all');
  const [modeFilter, setModeFilter] = useState<'all' | 'home_visit' | 'service_centre'>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<
    'recommended' | 'highest_rating' | 'experience' | 'bookings'
  >('recommended');
  const [showMapView, setShowMapView] = useState(false);

  // Sync from view params
  useEffect(() => {
    if (viewParams.city) setSelectedCity(viewParams.city);
    if (viewParams.area) setSelectedArea(viewParams.area);
    if (viewParams.serviceId) setSelectedServiceId(viewParams.serviceId);
  }, [viewParams]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCity && selectedCity !== 'All') params.append('city', selectedCity);
      if (selectedArea && selectedArea !== 'All') params.append('area', selectedArea);
      if (selectedServiceId && selectedServiceId !== 'all')
        params.append('serviceId', selectedServiceId);
      if (minRating > 0) params.append('minRating', String(minRating));
      if (modeFilter !== 'all') params.append('mode', modeFilter);

      const res = await fetch(`/api/workers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setWorkers(data);
      }
    } catch (err) {
      console.error('Failed to load workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [selectedCity, selectedArea, selectedServiceId, minRating, modeFilter]);

  // Client-side text filter & sort
  const filteredWorkers = workers
    .filter((w) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        w.displayName.toLowerCase().includes(q) ||
        w.bio.toLowerCase().includes(q) ||
        w.serviceAreas.some((a) => a.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'highest_rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      if (sortBy === 'bookings') return b.completedBookingsCount - a.completedBookingsCount;
      // recommended: balance rating and bookings
      return b.rating * 10 + b.completedBookingsCount - (a.rating * 10 + a.completedBookingsCount);
    });

  const activeAreas =
    serviceAreas.find((a) => a.city.toLowerCase() === selectedCity.toLowerCase())?.areas || [];

  return (
    <div className="bg-stone-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
            <button onClick={() => navigateTo('home')} className="hover:text-emerald-800">
              Home
            </button>
            <span>/</span>
            <span className="text-stone-900 font-semibold">Verified Specialists</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                Find a Verified Massage Specialist
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Browse CNIC-verified practitioners offering traditional oil champi and authentic chatai wellness.
              </p>
            </div>

            {/* Toggle Map View button */}
            <button
              onClick={() => setShowMapView(!showMapView)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showMapView
                  ? 'bg-emerald-900 text-white border-emerald-900'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-emerald-700'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>{showMapView ? 'Hide Service Hub Map' : 'View Service Hub Map'}</span>
            </button>
          </div>
        </div>

        {/* Interactive SVG Service Hub Map (if toggled) */}
        {showMapView && (
          <div className="mb-8 p-6 bg-white rounded-2xl border border-stone-200 shadow-sm animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-base text-stone-900">
                Active Service Hubs & Specialist Availability in Pakistan
              </h3>
              <span className="text-xs text-emerald-800 font-medium bg-emerald-50 px-2.5 py-1 rounded-md">
                Click a city to filter specialists
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {serviceAreas
                .filter((a) => a.enabled)
                .map((area) => {
                  const cityWorkerCount = workers.filter(
                    (w) => w.city.toLowerCase() === area.city.toLowerCase()
                  ).length;
                  const isSelected = selectedCity.toLowerCase() === area.city.toLowerCase();

                  return (
                    <button
                      key={area.id}
                      onClick={() => {
                        setSelectedCity(isSelected ? 'All' : area.city);
                        setSelectedArea('All');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                          : 'bg-stone-50 hover:bg-emerald-50 border-stone-200 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <MapPin className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-emerald-700'}`} />
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-emerald-800 text-amber-200' : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {cityWorkerCount} Active
                        </span>
                      </div>
                      <p className="font-bold text-sm mt-2">{area.city}</p>
                      <p className={`text-[11px] ${isSelected ? 'text-emerald-200' : 'text-stone-500'}`}>
                        {area.province}
                      </p>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-800" />
                  Filters
                </span>
                {(selectedCity !== 'All' ||
                  selectedArea !== 'All' ||
                  selectedServiceId !== 'all' ||
                  minRating > 0 ||
                  modeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedCity('All');
                      setSelectedArea('All');
                      setSelectedServiceId('all');
                      setMinRating(0);
                      setModeFilter('all');
                      setSearchQuery('');
                    }}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Text Search */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                  Specialist Search
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name, skill, or area..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedArea('All');
                  }}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="All">All Cities</option>
                  {serviceAreas
                    .filter((a) => a.enabled)
                    .map((a) => (
                      <option key={a.id} value={a.city}>
                        {a.city} ({a.province})
                      </option>
                    ))}
                </select>
              </div>

              {/* Neighbourhood / Area */}
              {activeAreas.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                    Neighbourhood
                  </label>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="All">All Neighbourhoods</option>
                    {activeAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Service Offering */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                  Service Specialization
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="all">All Services</option>
                  {services
                    .filter((s) => s.active)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Service Mode */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-2">
                  Service Method
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => setModeFilter('all')}
                    className={`py-1.5 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                      modeFilter === 'all'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setModeFilter('home_visit')}
                    className={`py-1.5 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                      modeFilter === 'home_visit'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    Home Visit
                  </button>
                  <button
                    onClick={() => setModeFilter('service_centre')}
                    className={`py-1.5 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                      modeFilter === 'service_centre'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    Centre
                  </button>
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                  Minimum Rating
                </label>
                <div className="flex items-center gap-1">
                  {[0, 4, 4.5, 4.8].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                        minRating === rating
                          ? 'bg-emerald-900 text-amber-200 border-emerald-900 font-bold'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {rating === 0 ? 'Any' : `${rating}+ Stars`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Worker Cards Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* Sorting bar & result count */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200">
              <span className="text-xs text-stone-600 font-medium">
                Showing <strong className="text-stone-900">{filteredWorkers.length}</strong> verified specialists
                {selectedCity !== 'All' ? ` in ${selectedCity}` : ''}
              </span>

              <div className="flex items-center gap-2 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-stone-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-stone-800 focus:outline-hidden"
                >
                  <option value="recommended">Recommended</option>
                  <option value="highest_rating">Highest Rating</option>
                  <option value="experience">Most Experienced</option>
                  <option value="bookings">Most Bookings</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-stone-200">
                <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-stone-500">Loading verified specialists...</p>
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div className="py-16 px-4 text-center bg-white rounded-2xl border border-stone-200">
                <Compass className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-lg text-stone-800">
                  No specialists found matching your criteria
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Try clearing your filters or selecting "All Cities" to discover specialists available in nearby regions.
                </p>
                <button
                  onClick={() => {
                    setSelectedCity('All');
                    setSelectedArea('All');
                    setSelectedServiceId('all');
                    setMinRating(0);
                    setModeFilter('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-lg hover:bg-emerald-900 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredWorkers.map((worker) => {
                  const workerServiceObjects = services.filter((s) =>
                    worker.approvedServices.includes(s.id)
                  );
                  const minPrice =
                    workerServiceObjects.length > 0
                      ? Math.min(...workerServiceObjects.map((s) => s.basePrice))
                      : 2000;

                  return (
                    <div
                      key={worker.id}
                      className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row gap-5"
                    >
                      {/* Avatar & Badges */}
                      <div className="flex md:flex-col items-center md:items-center gap-3 shrink-0">
                        <div className="relative">
                          <img
                            src={worker.profilePhoto}
                            alt={worker.displayName}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border border-stone-200 shadow-inner"
                            loading="lazy"
                          />
                          <span
                            className="absolute -bottom-1 -right-1 p-1 bg-emerald-700 text-white rounded-full shadow-xs"
                            title="CNIC Verified by Admin"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </span>
                        </div>

                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-xs font-bold text-amber-900">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          <span>{worker.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-stone-500 font-normal">
                            ({worker.reviewCount})
                          </span>
                        </div>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-serif font-bold text-lg text-stone-900 hover:text-emerald-900">
                                  {worker.displayName}
                                </h3>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  <Award className="w-3 h-3 text-emerald-700" />
                                  Verified Specialist
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                                  <strong className="text-stone-700">{worker.city}</strong>
                                </span>
                                <span>•</span>
                                <span>{worker.experienceYears} Years Exp</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Languages className="w-3.5 h-3.5 text-stone-400" />
                                  {worker.languages.join(', ')}
                                </span>
                              </div>
                            </div>

                            <div className="text-left sm:text-right">
                              <span className="text-[11px] text-stone-500 block uppercase font-medium">
                                Starting from
                              </span>
                              <span className="font-serif font-bold text-lg text-emerald-950">
                                {settings.currency} {minPrice.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-stone-600 mt-3 line-clamp-2 leading-relaxed">
                            {worker.bio}
                          </p>

                          {/* Service coverage pills */}
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-stone-500 font-medium mr-1">
                              Areas:
                            </span>
                            {worker.serviceAreas.slice(0, 4).map((area) => (
                              <span
                                key={area}
                                className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px]"
                              >
                                {area}
                              </span>
                            ))}
                            {worker.serviceAreas.length > 4 && (
                              <span className="text-[11px] text-stone-400">
                                +{worker.serviceAreas.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs">
                            {worker.homeVisitAvailable && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                                <Home className="w-3 h-3 text-emerald-700" />
                                Home Visit
                              </span>
                            )}
                            {worker.serviceCentreAvailable && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200">
                                <Building2 className="w-3 h-3 text-stone-600" />
                                Wellness Centre
                              </span>
                            )}
                            <span className="text-[11px] text-stone-500">
                              Hours: {worker.workingHoursStart} - {worker.workingHoursEnd}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => navigateTo('worker-detail', { id: worker.id })}
                              className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-emerald-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                            >
                              Profile & Reviews
                            </button>
                            <button
                              onClick={() => openBookingModal(undefined, worker.id)}
                              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Book Appointment</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

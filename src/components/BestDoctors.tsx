import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Users, MapPin, Star, Phone, Mail, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDoctorsByCity } from '../lib/supabase';
import 'leaflet/dist/leaflet.css';
import { useAppointmentStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';

// Fix for Leaflet marker icons
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  image_url?: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  available: boolean;
  bio: string;
}

interface City {
  name: string;
  latitude: number;
  longitude: number;
}

const BestDoctors: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedDoctor } = useAppointmentStore();
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([34.0489, -111.0937]); // Default to center of Arizona
  const [zoom, setZoom] = useState(4);

  const cities: City[] = [
    { name: 'Phoenix',       latitude: 33.4484, longitude: -112.0740 },
    { name: 'Tucson',        latitude: 32.2226, longitude: -110.9747 },
    { name: 'Mesa',          latitude: 33.4152, longitude: -111.8315 },
    { name: 'Chandler',      latitude: 33.3062, longitude: -111.8413 },
    { name: 'Scottsdale',    latitude: 33.4942, longitude: -111.9261 },
    { name: 'Glendale',      latitude: 33.5387, longitude: -112.1860 },
    { name: 'Gilbert',       latitude: 33.3528, longitude: -111.7890 },
    { name: 'Tempe',         latitude: 33.4255, longitude: -111.9400 },
    { name: 'Peoria',        latitude: 33.5806, longitude: -112.2374 },
    { name: 'Surprise',      latitude: 33.6292, longitude: -112.3679 },
    { name: 'Yuma',          latitude: 32.6927, longitude: -114.6277 },
    { name: 'Flagstaff',     latitude: 35.1983, longitude: -111.6513 },
    { name: 'Avondale',      latitude: 33.4356, longitude: -112.3496 },
    { name: 'Goodyear',      latitude: 33.4353, longitude: -112.3577 },
    { name: 'Lake Havasu City', latitude: 34.4839, longitude: -114.3225 },
    { name: 'Buckeye',       latitude: 33.3703, longitude: -112.5838 },
    { name: 'Casa Grande',   latitude: 32.8795, longitude: -111.7574 },
    { name: 'Sierra Vista',  latitude: 31.5455, longitude: -110.2773 },
    { name: 'Maricopa',      latitude: 33.0581, longitude: -112.0476 },
    { name: 'Prescott',      latitude: 34.5400, longitude: -112.4685 },
  ];

  useEffect(() => {
    if (selectedCity) {
      fetchDoctorsByCity(selectedCity.name);
      setMapCenter([selectedCity.latitude, selectedCity.longitude]);
      setZoom(12);
    } else {
      setDoctors([]);
      setMapCenter([34.0489, -111.0937]);
      setZoom(4);
    }
  }, [selectedCity]);

  const fetchDoctorsByCity = async (city: string) => {
    setLoading(true);
    try {
      const { data, error } = await getDoctorsByCity(city);
      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    navigate('/appointments');
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-900"
          >
            Find the <span className="bg-gradient-to-r from-red-600 via-pink-500 to-orange-500 text-transparent bg-clip-text">Best Doctors</span> Near You
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 max-w-2xl mx-auto text-xl text-gray-600"
          >
            Discover top-rated doctors in your city
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCity(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                !selectedCity 
                  ? 'bg-gradient-to-r from-red-600 via-pink-500 to-orange-500 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Arizona
            </button>
            {cities.map((city) => (
              <button
                key={city.name}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCity?.name === city.name 
                    ? 'bg-gradient-to-r from-red-600 via-pink-500 to-orange-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {selectedCity ? `Doctors in ${selectedCity.name}` : 'Select a city to view doctors'}
              </h3>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent"></div>
                  <span className="ml-2 text-gray-600">Loading doctors...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {doctors.length === 0 && selectedCity && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="mt-2 text-gray-500">No doctors found in {selectedCity.name}</p>
                      <p className="text-sm text-gray-400">Try selecting another city</p>
                    </div>
                  )}
                  
                  {doctors.map((doctor) => (
                    <motion.div
                      key={doctor.id}
                      whileHover={{ y: -5 }}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                          {doctor.image_url ? (
                            <img 
                              src={doctor.image_url} 
                              alt={doctor.name} 
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-red-600 via-pink-500 to-orange-500 flex items-center justify-center">
                              <Users className="h-8 w-8 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{doctor.name}</h4>
                          <p className="text-gray-600">{doctor.specialty}</p>
                          <div className="mt-1 flex items-center">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="ml-1 text-sm text-gray-500">{doctor.rating.toFixed(1)}</span>
                            <span className="mx-1 text-gray-300">•</span>
                            <span className="text-sm text-gray-500">{doctor.experience} yrs exp</span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            {doctor.city}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between">
                        <button
                          onClick={() => handleBookAppointment(doctor)}
                          className="px-3 py-1 bg-gradient-to-r from-red-600 via-pink-500 to-orange-500 text-white text-sm rounded-md hover:opacity-90"
                        >
                          Book Appointment
                        </button>
                        <Link
                          to={`/doctors/${doctor.id}`}
                          className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                        >
                          View Profile
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden h-[400px] relative z-0">
  <MapContainer 
    center={mapCenter} 
    zoom={zoom} 
    style={{ height: '100%', width: '100%', zIndex: 0 }} 
    zoomControl={false}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    
    {/* City markers */}
    {!selectedCity && cities.map((city) => (
      <Marker 
        key={city.name}
        position={[city.latitude, city.longitude]}
        eventHandlers={{
          click: () => setSelectedCity(city),
        }}
      >
        <Popup>
          <div className="text-center">
            <h3 className="font-medium">{city.name}</h3>
            <button
              onClick={() => setSelectedCity(city)}
              className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600"
            >
              View Doctors
            </button>
          </div>
        </Popup>
      </Marker>
    ))}
    
    {/* Doctor markers */}
    {doctors.map((doctor) => (
      <Marker
        key={doctor.id}
        position={[doctor.latitude, doctor.longitude]}
      >
        <Popup>
          <div className="text-center">
            <h3 className="font-medium">{doctor.name}</h3>
            <p className="text-sm text-gray-600">{doctor.specialty}</p>
            <div className="mt-1 flex items-center justify-center">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="ml-1 text-xs">{doctor.rating.toFixed(1)}</span>
            </div>
            <button
              onClick={() => handleBookAppointment(doctor)}
              className="mt-2 px-3 py-1 bg-gradient-to-r from-red-600 via-pink-500 to-orange-500 text-white text-xs rounded-md hover:opacity-90"
            >
              Book Appointment
            </button>
          </div>
        </Popup>
      </Marker>
    ))}
  </MapContainer>
</div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BestDoctors;
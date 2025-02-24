import React, { useEffect, useState, useRef } from 'react';
    import { db } from '../firebase';
    import { collection, getDocs } from 'firebase/firestore';
    import { FaInfoCircle } from 'react-icons/fa';
    import './Materiels.css';

    function Materiels() {
      const [equipment, setEquipment] = useState([]);
      const [selectedImage, setSelectedImage] = useState(null);
      const [selectedEquipment, setSelectedEquipment] = useState(null);
      const [showCommentPopup, setShowCommentPopup] = useState(false);
      const [vehicleFilter, setVehicleFilter] = useState('all');
      const [locationFilter, setLocationFilter] = useState('all');
      const [vehicles, setVehicles] = useState(['all']);
      const [locations, setLocations] = useState(['all']);

      const widgetContainerRef = useRef(null);

      useEffect(() => {
        const fetchEquipment = async () => {
          try {
            const querySnapshot = await getDocs(collection(db, 'materials'));
            const allItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Extract unique vehicles and locations
            const uniqueVehicles = ['all', ...new Set(allItems.map(item => item.affection))];
            const uniqueLocations = ['all', ...new Set(allItems.map(item => item.emplacement))];
            setVehicles(uniqueVehicles);
            setLocations(uniqueLocations);

            // Apply filters
            let filteredItems = [...allItems];
            if (vehicleFilter !== 'all') {
              filteredItems = filteredItems.filter(item => item.affection === vehicleFilter);
            }
            if (locationFilter !== 'all') {
              filteredItems = filteredItems.filter(item => item.emplacement === locationFilter);
            }

            setEquipment(filteredItems);
          } catch (error) {
            console.error("Error fetching equipment:", error);
          }
        };

        fetchEquipment();
      }, [vehicleFilter, locationFilter]);

      const handleImageClick = (imageSrc) => () => {
        setSelectedImage(imageSrc);
      };

      const closeModal = () => {
        setSelectedImage(null);
      };

      const handleBeaconClick = (item) => () => {
        setSelectedEquipment(item);
        setShowCommentPopup(true);
      };

      const closeCommentPopup = () => {
        setShowCommentPopup(false);
      };

      useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://elevenlabs.io/convai-widget/index.js";
        script.async = true;
        script.type = "text/javascript";

        script.onload = () => {
          // The script is loaded, now you can initialize the widget
          console.log("ElevenLabs widget script loaded");
          // You might need to manually trigger the widget initialization here
          // depending on how the widget is designed to be initialized.
          // For example, if the widget library exposes an init function, you can call it here.
        };

        script.onerror = () => {
          console.error("Failed to load ElevenLabs widget script");
        };

        document.head.appendChild(script);

        return () => {
          document.head.removeChild(script);
        };
      }, []);

      return (
        <main className="main-content">
          <div className="filters">
            <label htmlFor="vehicleFilter">Véhicule:</label>
            <select
              id="vehicleFilter"
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
            >
              {vehicles.map(vehicle => (
                <option key={vehicle} value={vehicle}>{vehicle}</option>
              ))}
            </select>

            <label htmlFor="locationFilter">Emplacement:</label>
            <select
              id="locationFilter"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className="equipment-list">
            {equipment.map((item) => (
              <div key={item.id} className="equipment-item">
                <img
                  src={item.photo}
                  alt={item.denomination}
                  className="equipment-image"
                  onClick={handleImageClick(item.photo) }
                  style={{ cursor: 'pointer' }}
                />
                <div className="equipment-details">
                  <div className="equipment-name">
                    {item.denomination}
                  </div>
                  <p>Quantité: {item.quantity}</p>
                  <a href="#">Documentation</a>
                  <p>Affectation: {item.affection}</p>
                  <p>Emplacement: {item.emplacement}</p>
                </div>
                {item.comment && (
                  <div className="beacon" onClick={handleBeaconClick(item)}>
                    <span className="beacon-icon">🚨</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedImage && (
            <div className="modal" onClick={closeModal}>
              <div className="modal-content">
                <span className="close" onClick={closeModal}>&times;</span>
                <img src={selectedImage} alt="Equipment Full Size" style={{ maxWidth: '90%', maxHeight: '90%' }} />
              </div>
            </div>
          )}

          {showCommentPopup && selectedEquipment && (
            <div className="modal">
              <div className="modal-content comment-modal">
                <span className="close" onClick={closeCommentPopup}>&times;</span>
                <div className="comment-header">
                  {selectedEquipment.timestamp && selectedEquipment.grade && selectedEquipment.name && (
                    <p className="comment-info">
                      {new Date(selectedEquipment.timestamp).toLocaleString()} - {selectedEquipment.grade} - {selectedEquipment.name}
                    </p>
                  )}
                  {selectedEquipment.userPhoto && (
                    <img
                      src={selectedEquipment.userPhoto}
                      alt="User"
                      className="comment-user-photo"
                    />
                  )}
                </div>
                <div className="comment-text">
                  {selectedEquipment.comment}
                </div>
                <button className="close-button" onClick={closeCommentPopup}>Fermer</button>
              </div>
            </div>
          )}

          {/* Widget Integration */}
          <div ref={widgetContainerRef}>
            <elevenlabs-convai agent-id="cPSFENw0adX5x4anM4CG"></elevenlabs-convai>
          </div>
        </main>
      );
    }

    export default Materiels;

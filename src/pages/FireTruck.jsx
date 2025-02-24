import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FaFileAlt, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './FireTruck.css';
import { onAuthStateChanged } from "firebase/auth";

function FireTruck() {
  const [fireTrucks, setFireTrucks] = useState([]);
  const navigate = useNavigate();
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [showCommentsPopup, setShowCommentsPopup] = useState(false);
  const [truckComments, setTruckComments] = useState([]);
  const [user, setUser] = useState(null);
  const [trucksWithNonOkStatus, setTrucksWithNonOkStatus] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchFireTrucks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vehicles'));
        const trucks = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            denomination: data.denomination || 'Nom inconnu',
            photo: data.photo || 'URL photo par défaut',
            lien: data.lien || null,
            verifiedBy: data.verifiedBy || null,
            verifiedByUserPhoto: data.verifiedByUserPhoto || null,
            verificationTimestamp: data.verificationTimestamp || null,
          };
        });
        setFireTrucks(trucks);
      } catch (error) {
        console.error("Erreur lors de la récupération des camions de pompiers :", error);
      }
    };

    const fetchTrucksWithNonOkStatus = async () => {
      try {
        const q = query(collection(db, 'materials'), where('status', '!=', 'ok'));
        const querySnapshot = await getDocs(q);
        const trucks = new Set(querySnapshot.docs.map(doc => doc.data().affection));
        setTrucksWithNonOkStatus(Array.from(trucks));
      } catch (error) {
        console.error("Erreur lors de la récupération des camions avec status non ok :", error);
      }
    };

    fetchFireTrucks();
    fetchTrucksWithNonOkStatus();
  }, []);

  const handleVerifyClick = (denomination) => {
    navigate(`/verification/${denomination}`);
  };

  const handleInfoClick = async (truck) => {
    setSelectedTruck(truck);
    setShowCommentsPopup(true);

    try {
      const q = query(
        collection(db, 'materials'),
        where('affection', '==', truck.denomination)
      );
      const querySnapshot = await getDocs(q);
      const comments = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setTruckComments(comments);
    } catch (error) {
      console.error("Erreur lors de la récupération des commentaires du camion :", error);
    }
  };

  const closeCommentsPopup = () => {
    setShowCommentsPopup(false);
  };

  const hasNonOkStatus = (truck) => {
    return trucksWithNonOkStatus.includes(truck.denomination);
  };

  const isVerificationVisible = (truck) => {
    if (!truck.verificationTimestamp) {
      return false;
    }

    const verificationDate = new Date(truck.verificationTimestamp);
    const now = new Date();

    const nextDay = new Date(verificationDate);
    nextDay.setDate(verificationDate.getDate() + 1);
    nextDay.setHours(8, 0, 0, 0);

    return now >= verificationDate && now < nextDay;
  };

  return (
    <main className="main-content">
      <div className="truck-list">
        {fireTrucks.map((truck) => (
          <div key={truck.id} className="truck-item">
            <img src={truck.photo} alt={truck.denomination} className="truck-image" />
            <div className="truck-details">
              <h3>
                {truck.denomination}
                {hasNonOkStatus(truck) && (
                  <span className="info-icon" onClick={() => handleInfoClick(truck)}>
                    <FaInfoCircle className="blinking-icon" />
                  </span>
                )}
              </h3>
            </div>
            <div className="truck-actions">
              <button className="verify-button" onClick={() => handleVerifyClick(truck.denomination)}>Vérifier</button>
              {isVerificationVisible(truck) && truck.verifiedBy && (
                <div className="verified-button verified-by">
                  Vérifié
                  {truck.verifiedByUserPhoto && (
                    <img
                      src={truck.verifiedByUserPhoto}
                      alt="Verified By"
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        marginLeft: '5px',
                      }}
                    />
                  )}
                </div>
              )}
              {truck.lien && (
                <a href={truck.lien} target="_blank" rel="noopener noreferrer">
                  <FaFileAlt size={20} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCommentsPopup && selectedTruck && (
        <div className="modal">
          <div className="modal-content comment-modal">
            <span className="close" onClick={closeCommentsPopup}>&times;</span>
            <h3>Commentaires pour {selectedTruck.denomination}</h3>
            {truckComments.length > 0 ? (
              truckComments.map((comment, index) => {
                if (comment.comment && comment.affection === selectedTruck.denomination) {
                  return (
                    <div key={index} className="comment-item">
                      {comment.denomination && <h4>{comment.denomination}</h4>}
                      {comment.comment && <p>{comment.comment}</p>}
                      {comment.timestamp && comment.grade && comment.name && (
                        <p className="comment-info">
                          {new Date(comment.timestamp).toLocaleString()} - {comment.grade} - {comment.name}
                        </p>
                      )}
                    </div>
                  );
                } else {
                  return null;
                }
              })
            ) : (
              <p>Aucun commentaire trouvé pour ce camion.</p>
            )}
            <button className="close-button" onClick={closeCommentsPopup}>Fermer</button>
          </div>
        </div>
      )}
    </main>
  );
}

export default FireTruck;

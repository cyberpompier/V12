import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import './Materiels.css';
import { onAuthStateChanged } from "firebase/auth";
import './Verification.css'; // Import Verification.css

function Verification() {
  const { truckId } = useParams();
  const [equipment, setEquipment] = useState([]);
  const [comment, setComment] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const q = query(collection(db, 'materials'), where('affection', '==', truckId));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEquipment(items);
      } catch (error) {
        console.error("Erreur lors de la récupération du matériel :", error);
      }
    };

    fetchEquipment();
  }, [truckId]);

  const handleValidClick = async (itemId) => {
    try {
      const itemDocRef = doc(db, 'materials', itemId);
      await updateDoc(itemDocRef, { status: 'ok', comment: '', timestamp: null, userPhoto: null, grade: null, name: null });

      setEquipment(prevEquipment =>
        prevEquipment.map(item =>
          item.id === itemId ? { ...item, status: 'ok', comment: '', timestamp: null, userPhoto: null, grade: null, name: null } : item
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
    }
  };

  const handleInvalidClick = async (itemId) => {
    setSelectedItemId(itemId);
    setComment('');
    setShowCommentPopup(true);
    setSelectedStatus('invalid');
    try {
      const itemDocRef = doc(db, 'materials', itemId);
      await updateDoc(itemDocRef, { status: 'invalid' });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
    }
  };

  const handleAlertClick = async (itemId) => {
    setSelectedItemId(itemId);
    setComment('');
    setShowCommentPopup(true);
    setSelectedStatus('alert');
    try {
      const itemDocRef = doc(db, 'materials', itemId);
      await updateDoc(itemDocRef, { status: 'alert' });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
    }
  };

  const handleCommentSubmit = async () => {
    try {
      if (!user) {
        console.error("No user is currently logged in.");
        return;
      }

      const itemDocRef = doc(db, 'materials', selectedItemId);
      const now = new Date();

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();

        await updateDoc(itemDocRef, {
          status: selectedStatus,
          comment: comment,
          timestamp: now.toISOString(),
          userPhoto: userDoc.userPhoto || null,
          grade: userDoc.Grade || null,
          name: userDoc.name || null
        });

        setEquipment(prevEquipment =>
          prevEquipment.map(item => {
            if (item.id === selectedItemId) {
              return {
                ...item,
                status: selectedStatus,
                comment: comment,
                timestamp: now.toISOString(),
                userPhoto: userDoc.userPhoto || null,
                grade: userDoc.Grade || null,
                name: userDoc.name || null
              };
            } else {
              return item;
            }
          })
        );
        setShowCommentPopup(false);
        setSelectedItemId(null);
        setComment('');
        setSelectedStatus(null);
      } else {
        console.error("Could not find user data in 'users' collection.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du commentaire :", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok':
        return '#fff';
      case 'invalid':
        return '#dc3545';
      case 'alert':
        return '#ffc107';
      default:
        return '#fff';
    }
  };

  const handleInfoClick = (item) => {
    setSelectedItem(item);
    setShowCommentPopup(true);
  };

  const closeCommentPopup = () => {
    setShowCommentPopup(false);
  };

  const handleValidateVerification = async () => {
    try {
      if (!user) {
        console.error("No user is currently logged in.");
        return;
      }

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        const now = new Date();

        const vehicleRef = collection(db, 'vehicles');
        const vehicleQuery = query(vehicleRef, where('denomination', '==', truckId));
        const vehicleSnapshot = await getDocs(vehicleQuery);

        if (!vehicleSnapshot.empty) {
          const vehicleDoc = vehicleSnapshot.docs[0].ref;
          await updateDoc(vehicleDoc, {
            verifiedBy: user.displayName || user.email,
            verifiedByUserPhoto: userDoc.userPhoto || null,
            verificationTimestamp: now.toISOString(),
          });

          navigate('/firetruck');
        } else {
          console.error("Vehicle not found in 'vehicles' collection.");
        }
      } else {
        console.error("Could not find user data in 'users' collection.");
      }
    } catch (error) {
      console.error("Erreur lors de la validation de la vérification :", error);
    }
  };

  return (
    <main className="main-content">
      <div className="equipment-list">
        {equipment.map((item, index) => (
          <div
            key={item.id}
            className="equipment-item"
            style={{ backgroundColor: getStatusColor(item.status) }}
          >
            <img
              src={item.photo}
              alt={item.denomination}
              className="equipment-image"
              style={{ cursor: 'pointer' }}
            />
            <div className="equipment-details">
              <div className="equipment-name">
                {item.denomination}
                {item.comment && (
                  <FaInfoCircle
                    size={16}
                    style={{ cursor: 'pointer', marginLeft: '5px' }}
                    onClick={() => handleInfoClick(item)}
                  />
                )}
              </div>
              <p>Quantité: {item.quantity}</p>
              <a href="#">Documentation</a>
              <p>Affectation: {item.affection}</p>
              <p>Emplacement: {item.emplacement}</p>
            </div>
            <div className="equipment-actions">
              <div className="action-button valid" onClick={() => handleValidClick(item.id)}>
                <FaCheck size={20} />
              </div>
              <div className="action-button invalid" onClick={() => handleInvalidClick(item.id)}>
                <FaTimes size={20} />
              </div>
              <div className="action-button alert" onClick={() => handleAlertClick(item.id)}>
                <FaExclamationTriangle size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCommentPopup && !selectedItem && (
        <div className="comment-input-modal modal">
          <div className="comment-input-modal-content modal-content">
            <span className="close" onClick={() => setShowCommentPopup(false)}>&times;</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Entrez votre commentaire"
            />
            <button onClick={() => handleCommentSubmit()}>Soumettre Commentaire</button>
          </div>
        </div>
      )}
      <button className="validate-button" onClick={handleValidateVerification}>
        Valider ma vérification
      </button>
    </main>
  );
}

export default Verification;

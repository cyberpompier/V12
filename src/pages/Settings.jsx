import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import './Settings.css';

function Settings() {
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showEditMaterialForm, setShowEditMaterialForm] = useState(false);

  const [newVehicleDenomination, setNewVehicleDenomination] = useState('');
  const [newVehicleImmatriculation, setNewVehicleImmatriculation] = useState('');
  const [newVehicleCaserne, setNewVehicleCaserne] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('');
  const [newVehicleEmplacements, setNewVehicleEmplacements] = useState('');
  const [newVehiclePhoto, setNewVehiclePhoto] = useState('');
  const [newVehicleLien, setNewVehicleLien] = useState('');
  const [newVehicleDocumentation, setNewVehicleDocumentation] = useState('');

  const [newMaterialDenomination, setNewMaterialDenomination] = useState('');
  const [newMaterialQuantity, setNewMaterialQuantity] = useState('');
  const [newMaterialAffection, setNewMaterialAffection] = useState('');
  const [newMaterialEmplacement, setNewMaterialEmplacement] = useState('');
  const [newMaterialPhoto, setNewMaterialPhoto] = useState('');
  const [newMaterialDocumentation, setNewMaterialDocumentation] = useState('');

  const [vehicles, setVehicles] = useState([]);
  const [emplacements, setEmplacements] = useState([]);
  const [materials, setMaterials] = useState([]); // All materials
  const [filteredMaterials, setFilteredMaterials] = useState([]); // Materials after filtering

  // New state for edit form
  const [editMaterialId, setEditMaterialId] = useState('');
  const [editMaterialDenomination, setEditMaterialDenomination] = useState('');
  const [editMaterialQuantity, setEditMaterialQuantity] = useState('');
  const [editMaterialAffection, setEditMaterialAffection] = useState('');
  const [editMaterialEmplacement, setEditMaterialEmplacement] = useState('');
  const [editMaterialPhoto, setEditMaterialPhoto] = useState('');
  const [editMaterialDocumentation, setEditMaterialDocumentation] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vehicles'));
        const vehicleList = querySnapshot.docs.map(doc => ({
          denomination: doc.data().denomination,
          emplacements: doc.data().emplacements ? doc.data().emplacements.split(',').map(s => s.trim()) : []
        }));
        setVehicles(vehicleList);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchVehicles();
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'materials'));
        const materialList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMaterials(materialList);
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    };

    fetchMaterials();
  }, []);

  useEffect(() => {
    // Update available emplacements based on selected vehicle
    if (editMaterialAffection) {
      const selectedVehicle = vehicles.find(v => v.denomination === editMaterialAffection);
      if (selectedVehicle) {
        setEmplacements(selectedVehicle.emplacements);
      } else {
        setEmplacements([]);
      }
    } else {
      setEmplacements([]);
    }
  }, [editMaterialAffection, vehicles]);

  useEffect(() => {
    // Filter materials based on selected vehicle and emplacement
    let filtered = [...materials];
    if (editMaterialAffection && editMaterialAffection !== '') {
      filtered = filtered.filter(m => m.affection === editMaterialAffection);
    }
    if (editMaterialEmplacement && editMaterialEmplacement !== '') {
      filtered = filtered.filter(m => m.emplacement === editMaterialEmplacement);
    }
    setFilteredMaterials(filtered);
  }, [editMaterialAffection, editMaterialEmplacement, materials]);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'vehicles'), {
        denomination: newVehicleDenomination,
        immatriculation: newVehicleImmatriculation,
        caserne: newVehicleCaserne,
        type: newVehicleType,
        emplacements: newVehicleEmplacements,
        photo: newVehiclePhoto,
        lien: newVehicleLien,
        documentation: newVehicleDocumentation
      });
      setNewVehicleDenomination('');
      setNewVehicleImmatriculation('');
      setNewVehicleCaserne('');
      setNewVehicleType('');
      setNewVehicleEmplacements('');
      setNewVehiclePhoto('');
      setNewVehicleLien('');
      setNewVehicleDocumentation('');
      setShowVehicleForm(false);
    } catch (error) {
      console.error("Error adding vehicle:", error);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'materials'), {
        denomination: newMaterialDenomination,
        quantity: newMaterialQuantity,
        affection: newMaterialAffection,
        emplacement: newMaterialEmplacement,
        photo: newMaterialPhoto,
        documentation: newMaterialDocumentation
      });
      setNewMaterialDenomination('');
      setNewMaterialQuantity('');
      setNewMaterialAffection('');
      setNewMaterialEmplacement('');
      setNewMaterialPhoto('');
      setNewMaterialDocumentation('');
      setShowMaterialForm(false);
    } catch (error) {
      console.error("Error adding material:", error);
    }
  };

  const handleEditMaterial = async (e) => {
    e.preventDefault();
    try {
      const materialDocRef = doc(db, 'materials', editMaterialId);
      await updateDoc(materialDocRef, {
        denomination: editMaterialDenomination,
        quantity: editMaterialQuantity,
        affection: editMaterialAffection,
        emplacement: editMaterialEmplacement,
        photo: editMaterialPhoto,
        documentation: editMaterialDocumentation
      });
      setShowEditMaterialForm(false);
    } catch (error) {
      console.error("Error editing material:", error);
    }
  };

  const openVehicleForm = () => {
    setShowVehicleForm(true);
  };

  const openMaterialForm = () => {
    setShowMaterialForm(true);
  };

  const openEditMaterialForm = () => {
    setShowEditMaterialForm(true);
  };

  const handleMaterialSelection = (e) => {
    const selectedMaterialId = e.target.value;
    setEditMaterialId(selectedMaterialId);

    const selectedMaterial = materials.find(m => m.id === selectedMaterialId);

    if (selectedMaterial) {
      setEditMaterialDenomination(selectedMaterial.denomination);
      setEditMaterialQuantity(selectedMaterial.quantity);
      setEditMaterialAffection(selectedMaterial.affection);
      setEditMaterialEmplacement(selectedMaterial.emplacement);
      setEditMaterialPhoto(selectedMaterial.photo);
      setEditMaterialDocumentation(selectedMaterial.documentation);
    } else {
      // Clear the form if no material is selected
      setEditMaterialDenomination('');
      setEditMaterialQuantity('');
      setEditMaterialAffection('');
      setEditMaterialEmplacement('');
      setEditMaterialPhoto('');
      setEditMaterialDocumentation('');
    }
  };

  const handleEditAffectionChange = (e) => {
    setEditMaterialAffection(e.target.value);
    setEditMaterialEmplacement(''); // Reset emplacement when vehicle changes
  };

    const getFilteredMaterials = () => {
        let filtered = [...materials];
        if (editMaterialAffection && editMaterialAffection !== '') {
            filtered = filtered.filter(m => m.affection === editMaterialAffection);
        }
        if (editMaterialEmplacement && editMaterialEmplacement !== '') {
            filtered = filtered.filter(m => m.emplacement === editMaterialEmplacement);
        }
        return filtered;
    };

    const getVehicleEmplacements = () => {
        const selectedVehicle = vehicles.find(v => v.denomination === editMaterialAffection);
        return selectedVehicle ? selectedVehicle.emplacements : [];
    };

  return (
    <main className="main-content">
      <button onClick={openVehicleForm} className="settings-button">Ajouter un véhicule</button>
      <button onClick={openMaterialForm} className="settings-button">Ajouter un matériel</button>
      <button onClick={openEditMaterialForm} className="settings-button">Edition du materiel</button>

      {showVehicleForm && (
        <div className="modal">
          <div className="modal-content settings-modal">
            <span className="close" onClick={() => setShowVehicleForm(false)}>&times;</span>
            <h3>Ajouter un véhicule</h3>
            <form onSubmit={handleAddVehicle} className="settings-form">
              <input
                type="text"
                placeholder="Denomination"
                value={newVehicleDenomination}
                onChange={(e) => setNewVehicleDenomination(e.target.value)}
                className="settings-input"
              />
              <input
                type="text"
                placeholder="Immatriculation"
                value={newVehicleImmatriculation}
                onChange={(e) => setNewVehicleImmatriculation(e.target.value)}
                className="settings-input"
              />
              <input
                type="text"
                placeholder="Caserne"
                value={newVehicleCaserne}
                onChange={(e) => setNewVehicleCaserne(e.target.value)}
                className="settings-input"
              />
              <input
                type="text"
                placeholder="Type"
                value={newVehicleType}
                onChange={(e) => setNewVehicleType(e.target.value)}
                className="settings-input"
              />
              <input
                type="text"
                placeholder="Emplacements"
                value={newVehicleEmplacements}
                onChange={(e) => setNewVehicleEmplacements(e.target.value)}
                className="settings-input"
              />
              <div className="settings-buttons">
                <button type="submit" className="settings-submit-button">Ajouter</button>
                <button type="button" className="settings-cancel-button" onClick={() => setShowVehicleForm(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMaterialForm && (
        <div className="modal">
          <div className="modal-content settings-modal">
            <span className="close" onClick={() => setShowMaterialForm(false)}>&times;</span>
            <h3>Ajouter un matériel</h3>
            <form onSubmit={handleAddMaterial} className="settings-form">
              <input
                type="text"
                placeholder="Denomination"
                value={newMaterialDenomination}
                onChange={(e) => setNewMaterialDenomination(e.target.value)}
                className="settings-input"
              />
              <input
                type="number"
                placeholder="Quantité"
                value={newMaterialQuantity}
                onChange={(e) => setNewMaterialQuantity(e.target.value)}
                className="settings-input"
              />
              <select
                value={newMaterialAffection}
                onChange={(e) => setNewMaterialAffection(e.target.value)}
                className="settings-input"
              >
                <option value="">Sélectionner un véhicule</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.denomination} value={vehicle.denomination}>{vehicle.denomination}</option>
                ))}
              </select>
              <select
                value={newMaterialEmplacement}
                onChange={(e) => setNewMaterialEmplacement(e.target.value)}
                className="settings-input"
              >
                <option value="">Sélectionner un emplacement</option>
                {emplacements.map(emplacement => (
                  <option key={emplacement} value={emplacement}>{emplacement}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Photo URL"
                value={newMaterialPhoto}
                onChange={(e) => setNewMaterialPhoto(e.target.value)}
                className="settings-input"
              />
              <input
                type="text"
                placeholder="Documentation URL (optionnel)"
                value={newMaterialDocumentation}
                onChange={(e) => setNewMaterialDocumentation(e.target.value)}
                className="settings-input"
              />
              <div className="settings-buttons">
                <button type="submit" className="settings-submit-button">Ajouter</button>
                <button type="button" className="settings-cancel-button" onClick={() => setShowMaterialForm(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditMaterialForm && (
        <div className="modal">
          <div className="modal-content settings-modal">
            <span className="close" onClick={() => setShowEditMaterialForm(false)}>&times;</span>
            <h3>Edition du materiel</h3>
            <form onSubmit={handleEditMaterial} className="settings-form">
              <select
                value={editMaterialAffection}
                onChange={handleEditAffectionChange}
                className="settings-input"
              >
                <option value="">Sélectionner un véhicule</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.denomination} value={vehicle.denomination}>{vehicle.denomination}</option>
                ))}
              </select>
              <select
                value={editMaterialEmplacement}
                onChange={(e) => setEditMaterialEmplacement(e.target.value)}
                className="settings-input"
              >
                <option value="">Sélectionner un emplacement</option>
                {getVehicleEmplacements().map(emplacement => (
                  <option key={emplacement} value={emplacement}>{emplacement}</option>
                ))}
              </select>
              <select
                value={editMaterialId}
                onChange={handleMaterialSelection}
                className="settings-input"
              >
                <option value="">Sélectionner un matériel</option>
                {getFilteredMaterials().map(material => (
                  <option key={material.id} value={material.id}>
                    {material.denomination}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Denomination"
                value={editMaterialDenomination}
                onChange={(e) => setEditMaterialDenomination(e.target.value)}
                className="settings-input"
              />
              <input
                type="number"
                placeholder="Quantité"
                value={editMaterialQuantity}
                onChange={(e) => setEditMaterialQuantity(e.target.value)}
                className="settings-input"
              />
              <input
                type="text"
                placeholder="Photo URL"
                value={editMaterialPhoto}
                onChange={(e) => setEditMaterialPhoto(e.target.value)}
                className="settings-input"
              />
              <input
                type="text"
                placeholder="Documentation URL (optionnel)"
                value={editMaterialDocumentation}
                onChange={(e) => setEditMaterialDocumentation(e.target.value)}
                className="settings-input"
              />
              <div className="settings-buttons">
                <button type="submit" className="settings-submit-button">Modifier</button>
                <button type="button" className="settings-cancel-button" onClick={() => setShowEditMaterialForm(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Settings;

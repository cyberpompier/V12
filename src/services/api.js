// src/services/api.js

// Simulate Firebase data
const fireTrucksData = [
  {
    id: 1,
    name: 'VSAV1',
    lastVerification: '05/02/2025',
    image: 'https://via.placeholder.com/100x80/007bff/ffffff?text=VSAV1',
  },
  {
    id: 2,
    name: 'FPT',
    lastVerification: '03/02/2025',
    image: 'https://via.placeholder.com/100x80/dc3545/ffffff?text=FPT',
  },
];

const equipmentData = [
  {
    id: 1,
    name: 'Seau pompe',
    quantity: 1,
    location: 'coffre AV gauche',
    image: 'https://via.placeholder.com/80x80/4CAF50/ffffff?text=Seau',
  },
  {
    id: 2,
    name: 'MULTI paramétrique',
    quantity: 1,
    location: 'Plateau',
    image: 'https://via.placeholder.com/80x80/2196F3/ffffff?text=Multi',
  },
  {
    id: 3,
    name: 'Aspirateur',
    quantity: 1,
    location: 'Plateau',
    image: 'https://via.placeholder.com/80x80/9C27B0/ffffff?text=Aspi',
  },
];

// Simulate API calls
export const getFireTrucks = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(fireTrucksData);
    }, 500);
  });
};

export const getEquipment = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(equipmentData);
    }, 500);
  });
};

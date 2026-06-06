import { Patient } from '../types';

// Données par défaut avec des patients fictifs à La Réunion
// La pharmacie est le premier point (point de départ)
export const defaultPatients: Patient[] = [
  {
    id: 'pharmacy-1',
    nom: 'Pharmacie Centrale',
    adresse: '133 Avenue du Mahatma Gandhi, 97441 Sainte-Suzanne',
    latitude: -20.9333,
    longitude: 55.6167,
    isPharmacy: true,
  },
  {
    id: 'patient-1',
    nom: 'M. Martin',
    adresse: '15 Rue du Commerce, Saint-Denis 97400',
    latitude: -20.8821,
    longitude: 55.4508,
    isPharmacy: false,
  },
  {
    id: 'patient-2',
    nom: 'Mme Durand',
    adresse: '23 Avenue de la République, Saint-Pierre 97410',
    latitude: -21.3408,
    longitude: 55.4769,
    isPharmacy: false,
  },
  {
    id: 'patient-3',
    nom: 'Dr. Bernard',
    adresse: '8 Rue des Alizés, Le Tampon 97430',
    latitude: -21.2742,
    longitude: 55.5135,
    isPharmacy: false,
  },
  {
    id: 'patient-4',
    nom: 'Mlle Dubois',
    adresse: '45 Chemin des Fleurs, Saint-Paul 97460',
    latitude: -21.0108,
    longitude: 55.2735,
    isPharmacy: false,
  },
  {
    id: 'patient-5',
    nom: 'M. Leroy',
    adresse: '12 Rue de la Montagne, Saint-André 97440',
    latitude: -20.9581,
    longitude: 55.6558,
    isPharmacy: false,
  },
  {
    id: 'patient-6',
    nom: 'Mme Moreau',
    adresse: '33 Boulevard des Crêtes, Saint-Leu 97436',
    latitude: -21.1667,
    longitude: 55.3333,
    isPharmacy: false,
  },
  {
    id: 'patient-7',
    nom: 'Dr. Petit',
    adresse: '7 Rue des Écoles, Saint-Benoît 97470',
    latitude: -21.0333,
    longitude: 55.7167,
    isPharmacy: false,
  },
  {
    id: 'patient-8',
    nom: 'M. Roux',
    adresse: '18 Allée des Palmiers, Saint-Louis 97450',
    latitude: -21.2833,
    longitude: 55.4167,
    isPharmacy: false,
  },
  {
    id: 'patient-9',
    nom: 'Mme Blanc',
    adresse: '29 Rue du Port, Saint-Gilles-les-Bains 97434',
    latitude: -21.0667,
    longitude: 55.2333,
    isPharmacy: false,
  },
  {
    id: 'patient-10',
    nom: 'M. Vincent',
    adresse: '5 Rue de la Plage, Étang-Salé 97427',
    latitude: -21.2667,
    longitude: 55.3667,
    isPharmacy: false,
  },
];

export const getDefaultPatients = (): Patient[] => {
  return [...defaultPatients];
};

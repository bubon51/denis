import { Patient, CSVPatient } from '../types';
import Papa from 'papaparse';

// Convertir Patient en CSVPatient (pour l'export)
const patientToCSV = (patient: Patient): CSVPatient => ({
  nom: patient.nom,
  prenom: patient.prenom || '',
  adresse: patient.adresse,
  latitude: patient.latitude.toString(),
  longitude: patient.longitude.toString(),
  phone: patient.phone || '',
});

// Convertir CSVPatient en Patient (pour l'import)
const csvToPatient = (csv: CSVPatient, id: string): Patient => ({
  id,
  nom: csv.nom,
  prenom: csv.prenom || '',
  adresse: csv.adresse,
  latitude: parseFloat(csv.latitude),
  longitude: parseFloat(csv.longitude),
  isPharmacy: false,
  phone: csv.phone || undefined,
});

// Exporter les patients en CSV
export const exportToCSV = (patients: Patient[]): string => {
  const csvData = patients.map(patientToCSV);
  return Papa.unparse(csvData, {
    header: true,
    delimiter: ';',
    quotes: true,
    quoteChar: '"',
  });
};

// Importer les patients depuis un fichier CSV
export const importFromCSV = (csvContent: string): Patient[] => {
  const results = Papa.parse<CSVPatient>(csvContent, {
    header: true,
    delimiter: ';',
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (results.errors.length > 0) {
    console.error('Erreurs lors de l\'import CSV:', results.errors);
    throw new Error('Format CSV invalide');
  }

  const patients: Patient[] = [];
  results.data.forEach((row, index) => {
    try {
      if (row.nom && row.adresse && row.latitude && row.longitude) {
        const patient = csvToPatient(row, `imported-${index}`);
        patients.push(patient);
      }
    } catch (error) {
      console.error(`Erreur lors de la conversion de la ligne ${index}:`, error);
    }
  });

  return patients;
};

// Vérifier si un CSV est valide
export const validateCSV = (csvContent: string): boolean => {
  try {
    const results = Papa.parse(csvContent, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
    });

    // Vérifier que les colonnes requises sont présentes
    const requiredColumns = ['nom', 'adresse', 'latitude', 'longitude'];
    const hasAllColumns = requiredColumns.every(col => 
      results.meta.fields?.includes(col)
    );

    return hasAllColumns && results.errors.length === 0;
  } catch {
    return false;
  }
};

// Générer un nom de fichier pour l'export
export const generateCSVFileName = (): string => {
  const date = new Date();
  const dateStr = date.toLocaleDateString('fr-FR').replace(/\//g, '-');
  const timeStr = date.toLocaleTimeString('fr-FR').replace(/:/g, '-').replace(/\s/g, '_');
  return `patients_${dateStr}_${timeStr}.csv`;
};

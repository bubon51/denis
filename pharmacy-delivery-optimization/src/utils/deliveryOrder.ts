/**
 * Utilitaires pour générer et exporter l'ordre de livraison optimisé.
 * Format A4 : 20 patients par page, date du jour en haut, carré vide de 2cm x 1cm en haut à gauche.
 */
import { OptimizationResult } from '../types';

// Constantes pour le format A4
const PATIENTS_PER_PAGE = 20;

/**
 * Formate un patient pour l'impression.
 */
const formatPatientForPrint = (routePoint: { patient: { id: string; nom: string; prenom: string; adresse: string; phone?: string; isPharmacy?: boolean; hasColdDelivery?: boolean }; order: number }, index: number): string => {
  const patient = routePoint.patient;
  const orderNumber = index + 1;
  
  // Ignorer la pharmacie dans la liste
  if (patient.isPharmacy) {
    return '';
  }
  
  const coldIcon = patient.hasColdDelivery ? '❄️ ' : '  ';
  const phone = patient.phone || 'N/A';
  
  // Format : "1. [❄️] Jean Martin - 06 12 34 56 78 - 15 Rue du Commerce, Saint-Denis 97400"
  return `${String(orderNumber).padStart(2, ' ')}. [${coldIcon}]${patient.prenom} ${patient.nom} - ${phone} - ${patient.adresse}`;
};

/**
 * Génère une page A4 avec 20 patients.
 */
const generateA4Page = (route: { patient: { id: string; nom: string; prenom: string; adresse: string; phone?: string; isPharmacy?: boolean; hasColdDelivery?: boolean }; order: number }[], startIndex: number, date: string, isLastPage: boolean): string => {
  const lines: string[] = [];
  
  // Ligne 1 : Carré vide de 2cm x 1cm (représenté par des espaces)
  // On ajoute des espaces pour simuler le carré vide en haut à gauche
  const squarePadding = ' '.repeat(10); // Environ 2cm en espaces (ajustable)
  lines.push(squarePadding + date);
  lines.push('');
  
  // En-tête de la page
  lines.push('=== ORDRE DE LIVRAISON OPTIMISÉ ===');
  lines.push('');
  
  // Liste des patients (20 par page)
  const endIndex = Math.min(startIndex + PATIENTS_PER_PAGE, route.length);
  for (let i = startIndex; i < endIndex; i++) {
    const formattedPatient = formatPatientForPrint(route[i], i);
    if (formattedPatient) {
      lines.push(formattedPatient);
    }
  }
  
  // Pied de page (si ce n'est pas la dernière page)
  if (!isLastPage) {
    lines.push('');
    lines.push('--- Suite page suivante ---');
  }
  
  return lines.join('\n');
};

/**
 * Génère un texte formaté pour l'ordre de livraison optimisé au format A4.
 * @param optimizationResult - Résultat de l'optimisation de la tournée.
 * @returns Texte formaté prêt à être imprimé ou exporté.
 */
export const generateDeliveryOrderText = (optimizationResult: OptimizationResult | null): string => {
  if (!optimizationResult) {
    return "Aucun ordre de livraison disponible. Veuillez d'abord optimiser la tournée.";
  }

  const { route, totalDistance, totalTime } = optimizationResult;
  
  // Filtrer les patients non-pharmacie pour le compte
  const nonPharmacyPatients = route.filter(rp => !rp.patient.isPharmacy);
  const totalPatients = nonPharmacyPatients.length;
  
  // Date du jour
  const date = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Générer les pages
  const pages: string[] = [];
  const totalPages = Math.ceil(nonPharmacyPatients.length / PATIENTS_PER_PAGE);
  
  for (let page = 0; page < totalPages; page++) {
    const startIndex = page * PATIENTS_PER_PAGE;
    const isLastPage = page === totalPages - 1;
    
    // Ajouter l'en-tête avec distance et temps total uniquement sur la première page
    if (page === 0) {
      const headerPage = generateA4Page(route, startIndex, date, isLastPage);
      const headerLines = headerPage.split('\n');
      
      // Insérer distance et temps après la date
      const dateIndex = headerLines.findIndex(line => line.includes(date));
      if (dateIndex !== -1) {
        headerLines.splice(dateIndex + 2, 0, `Distance totale : ${totalDistance.toFixed(2)} km`);
        headerLines.splice(dateIndex + 3, 0, `Temps total estimé : ${Math.round(totalTime)} minutes`);
        headerLines.splice(dateIndex + 4, 0, `Nombre de patients : ${totalPatients}`);
        headerLines.splice(dateIndex + 5, 0, '');
      }
      
      pages.push(headerLines.join('\n'));
    } else {
      pages.push(generateA4Page(route, startIndex, date, isLastPage));
    }
  }
  
  return pages.join('\n\n');
};

/**
 * Exporte l'ordre de livraison sous forme de fichier texte.
 * @param optimizationResult - Résultat de l'optimisation de la tournée.
 * @returns Objet contenant l'URL du blob et le nom du fichier.
 */
export const exportDeliveryOrder = (optimizationResult: OptimizationResult | null): { blobUrl: string; fileName: string } => {
  const text = generateDeliveryOrderText(optimizationResult);
  
  // Créer un blob avec le texte
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);

  // Générer un nom de fichier avec la date
  const date = new Date();
  const dateStr = date.toLocaleDateString('fr-FR').replace(/\//g, '-');
  const fileName = `ordre_livraison_${dateStr}.txt`;

  return { blobUrl, fileName };
};

/**
 * Exporte l'ordre de livraison et déclenche le téléchargement.
 * @param optimizationResult - Résultat de l'optimisation de la tournée.
 */
export const downloadDeliveryOrder = (optimizationResult: OptimizationResult | null): void => {
  const { blobUrl, fileName } = exportDeliveryOrder(optimizationResult);
  
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Nettoyer l'URL du blob après le téléchargement
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 100);
};

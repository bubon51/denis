/**
 * Utilitaires pour générer et exporter l'ordre de livraison optimisé.
 */
import { OptimizationResult } from '../types';

/**
 * Génère un texte formaté pour l'ordre de livraison optimisé.
 * @param optimizationResult - Résultat de l'optimisation de la tournée.
 * @returns Texte formaté prêt à être imprimé ou exporté.
 */
export const generateDeliveryOrderText = (optimizationResult: OptimizationResult | null): string => {
  if (!optimizationResult) {
    return "Aucun ordre de livraison disponible. Veuillez d'abord optimiser la tournée.";
  }

  const { route, totalDistance, totalTime } = optimizationResult;
  const lines: string[] = [];

  // En-tête
  lines.push("=== ORDRE DE LIVRAISON OPTIMISÉ ===");
  lines.push("");
  lines.push(`Distance totale : ${totalDistance.toFixed(2)} km`);
  lines.push(`Temps total estimé : ${Math.round(totalTime)} minutes`);
  lines.push("");
  lines.push("---");

  // Liste des patients dans l'ordre optimisé
  route.forEach((routePoint, index) => {
    const patient = routePoint.patient;
    const orderNumber = index + 1;
    
    // Ignorer la pharmacie dans la liste (elle est au début et à la fin)
    if (patient.isPharmacy) {
      return;
    }

    // Ligne du patient
    const coldIcon = patient.hasColdDelivery ? "❄️ " : "  ";
    lines.push(`${orderNumber}. [${coldIcon}]${patient.prenom} ${patient.nom}`);
    lines.push(`   Adresse: ${patient.adresse}`);
    lines.push(`   Tél: ${patient.phone || 'N/A'}`);
    lines.push("");
  });

  lines.push("---");
  lines.push("Fin de l'ordre de livraison");

  return lines.join("\n");
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

  // Générer un nom de fichier avec la date et l'heure
  const date = new Date();
  const dateStr = date.toLocaleDateString('fr-FR').replace(/\//g, '-');
  const timeStr = date.toLocaleTimeString('fr-FR').replace(/:/g, '-').replace(/\s/g, '_');
  const fileName = `ordre_livraison_${dateStr}_${timeStr}.txt`;

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

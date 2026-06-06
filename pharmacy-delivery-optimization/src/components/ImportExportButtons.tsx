import React, { useRef } from 'react';
import { Button, Space, Upload, message, Tooltip } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';

interface ImportExportButtonsProps {
  onExport: () => string;
  onImport: (csvContent: string) => void;
  onReset: () => void;
}

const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({ onExport, onImport, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exporter en CSV
  const handleExport = () => {
    try {
      const csv = onExport();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `patients_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('Export CSV réussi');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      message.error('Erreur lors de l\'export CSV');
    }
  };

  // Importer depuis CSV
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        onImport(content);
        message.success('Import CSV réussi');
      } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        message.error('Erreur lors de l\'import CSV. Vérifiez le format du fichier.');
      }
    };
    reader.readAsText(file);
    
    // Réinitialiser l'input pour permettre de sélectionner le même fichier à nouveau
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Réinitialiser aux données par défaut
  const handleReset = () => {
    onReset();
    message.success('Données réinitialisées aux valeurs par défaut');
  };

  return (
    <Space wrap>
      <Tooltip title="Exporter la liste des patients en CSV">
        <Button
          type="default"
          icon={<DownloadOutlined />}
          onClick={handleExport}
        >
          Exporter en CSV
        </Button>
      </Tooltip>

      <Tooltip title="Importer des patients depuis un fichier CSV">
        <Button
          icon={<UploadOutlined />}
          onClick={() => fileInputRef.current?.click()}
        >
          Importer depuis CSV
        </Button>
      </Tooltip>
      
      {/* Input caché pour l'import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleImport}
        style={{ display: 'none' }}
        id="csv-import-input"
      />

      <Tooltip title="Réinitialiser aux données par défaut">
        <Button
          icon={<DeleteOutlined />}
          danger
          onClick={handleReset}
        >
          Réinitialiser
        </Button>
      </Tooltip>
    </Space>
  );
};

export default ImportExportButtons;

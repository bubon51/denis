import React, { useRef } from 'react';
import { Button, Space, Upload, message, Tooltip } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { usePatients } from '../hooks/usePatients';
import { generateCSVFileName } from '../utils/csv';

interface ImportExportButtonsProps {
  onReset: () => void;
}

const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({ onReset }) => {
  const {
    exportPatients,
    importPatients,
    resetToDefault,
  } = usePatients();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exporter en CSV
  const handleExport = () => {
    try {
      const csv = exportPatients();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = generateCSVFileName();
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
        importPatients(content);
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
    resetToDefault();
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
        <Upload
          showUploadList={false}
          beforeUpload={() => false} // Désactiver l'upload automatique
        >
          <Button icon={<UploadOutlined />}>
            Importer depuis CSV
          </Button>
        </Upload>
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
      <label htmlFor="csv-import-input" style={{ display: 'none' }}>
        Importer CSV
      </label>

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

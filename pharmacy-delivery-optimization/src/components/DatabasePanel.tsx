import React, { useState } from 'react';
import { Card, Button, List, Checkbox, Modal, message, Input, Space, Typography } from 'antd';
import { DatabaseOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons';
import { Patient } from '../types';

interface DatabasePanelProps {
  databasePatients: Patient[];
  onAddToDatabase: (patient: Omit<Patient, 'id' | 'isPharmacy' | 'latitude' | 'longitude'>) => Promise<void>;
  onLoadFromDatabase: (patientIds: string[]) => void;
  isGeocoding: boolean;
}

const { Text } = Typography;

const DatabasePanel: React.FC<DatabasePanelProps> = ({
  databasePatients,
  onAddToDatabase,
  onLoadFromDatabase,
  isGeocoding,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [newPatient, setNewPatient] = useState({
    nom: '',
    prenom: '',
    adresse: '',
  });

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientIds(prev => 
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatientIds.length === databasePatients.length) {
      setSelectedPatientIds([]);
    } else {
      setSelectedPatientIds(databasePatients.map(p => p.id));
    }
  };

  const handleLoadSelected = () => {
    if (selectedPatientIds.length === 0) {
      message.warning('Veuillez sélectionner au moins un patient');
      return;
    }
    onLoadFromDatabase(selectedPatientIds);
    message.success(`${selectedPatientIds.length} patient(s) chargé(s) dans la tournée`);
    setSelectedPatientIds([]);
  };

  const handleAddNewPatient = async () => {
    if (!newPatient.nom || !newPatient.adresse) {
      message.error('Veuillez remplir au moins le nom et l\'adresse');
      return;
    }
    
    try {
      await onAddToDatabase({
        nom: newPatient.nom,
        prenom: newPatient.prenom,
        adresse: newPatient.adresse,
      });
      message.success('Patient ajouté à la base de données');
      setNewPatient({
        nom: '',
        prenom: '',
        adresse: '',
      });
      setIsModalVisible(false);
    } catch (error) {
      message.error('Erreur lors de l\'ajout du patient');
    }
  };

  return (
    <Card
      title={
        <Space>
          <DatabaseOutlined />
          <span>Base de données des patients ({databasePatients.length})</span>
        </Space>
      }
      size="small"
      style={{ marginBottom: 16 }}
      headStyle={{ backgroundColor: '#f0f0f0' }}
      bodyStyle={{ padding: '12px' }}
    >
      <Space style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          disabled={isGeocoding}
        >
          Ajouter un patient
        </Button>
        <Button
          type="default"
          icon={<CheckOutlined />}
          onClick={handleSelectAll}
        >
          {selectedPatientIds.length === databasePatients.length ? 'Désélectionner tout' : 'Sélectionner tout'}
        </Button>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={handleLoadSelected}
          disabled={selectedPatientIds.length === 0}
        >
          Charger les sélectionnés ({selectedPatientIds.length})
        </Button>
      </Space>

      {databasePatients.length === 0 ? (
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 20 }}>
          Aucune donnée de patient enregistrée. Ajoutez des patients pour les réutiliser dans vos futures tournées.
        </Text>
      ) : (
        <List
          dataSource={databasePatients}
          renderItem={(patient) => (
            <List.Item
              style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}
              actions={[
                <Checkbox
                  checked={selectedPatientIds.includes(patient.id)}
                  onChange={() => handleSelectPatient(patient.id)}
                />,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{patient.prenom} {patient.nom}</Text>
                  </Space>
                }
                description={
                  <>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {patient.adresse}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      Coordonnées: {patient.latitude.toFixed(4)}, {patient.longitude.toFixed(4)}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}

      {/* Modal pour ajouter un nouveau patient à la base de données */}
      <Modal
        title="Ajouter un patient à la base de données"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Annuler
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleAddNewPatient}
            loading={isGeocoding}
          >
            Ajouter à la base de données
          </Button>,
        ]}
        destroyOnClose
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="Prénom"
              value={newPatient.prenom}
              onChange={(e) => setNewPatient({ ...newPatient, prenom: e.target.value })}
              style={{ width: '50%' }}
            />
            <Input
              placeholder="Nom *"
              value={newPatient.nom}
              onChange={(e) => setNewPatient({ ...newPatient, nom: e.target.value })}
              style={{ width: '50%' }}
              required
            />
          </Space.Compact>
          <Input
            placeholder="Adresse *"
            value={newPatient.adresse}
            onChange={(e) => setNewPatient({ ...newPatient, adresse: e.target.value })}
            required
          />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            * Les coordonnées GPS seront automatiquement déterminées à partir de l'adresse.
            <br />
            * Temps de livraison fixe : 1 minute par patient
          </Text>
        </Space>
      </Modal>
    </Card>
  );
};

export default DatabasePanel;

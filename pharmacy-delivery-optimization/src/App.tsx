import React, { useState } from 'react';
import { Layout, Typography, theme, Divider, FloatButton, message, Tabs, Button, Popconfirm, Spin, Switch, Tooltip } from 'antd';
import { usePatients } from './hooks/usePatients';
import PatientTable from './components/PatientTable';
import PatientForm from './components/PatientForm';
import MapView from './components/MapView';
import OptimizationPanel from './components/OptimizationPanel';
import ImportExportButtons from './components/ImportExportButtons';
import SearchBar from './components/SearchBar';
import DatabasePanel from './components/DatabasePanel';
import { Patient } from './types';
import { DeleteOutlined, ClusterOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const App: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const {
    patients,
    filteredPatients,
    addPatient,
    updatePatient,
    deletePatient,
    optimizationResult,
    isOptimizing,
    optimizeRoute,
    exportPatients,
    importPatients,
    resetToDefault,
    searchQuery,
    setSearchQuery,
    isGeocoding,
    routePolyline,
    // Base de données
    databasePatients,
    addToDatabase,
    loadFromDatabase,
    clearCurrentTour,
    // État de chargement
    isLoading,
  } = usePatients();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [enableClustering, setEnableClustering] = useState(true);

  const handleAddPatient = () => {
    setEditingPatient(null);
    setIsFormVisible(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsFormVisible(true);
  };

  const handleFormSubmit = async (patientData: Omit<Patient, 'id' | 'isPharmacy' | 'latitude' | 'longitude'>) => {
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, patientData);
      } else {
        await addPatient(patientData);
      }
      setIsFormVisible(false);
      setEditingPatient(null);
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    resetToDefault();
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#1890ff', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            🏥 Optimisation Tournées Livraison - La Réunion
          </Title>
        </div>
      </Header>

      <Content style={{ padding: '24px', backgroundColor: colorBgContainer }}>
        <Spin spinning={isLoading} size="large" tip="Chargement des données..." fullscreen />
        <div
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            padding: 24,
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          {/* Onglets pour basculer entre la tournée actuelle et la base de données */}
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: `Tournée actuelle (${patients.length - 1} patients)`,
                children: (
                  <>
                    {/* Barre de recherche */}
                    <SearchBar
                      value={searchQuery}
                      onChange={setSearchQuery}
                    />

                    {/* Boutons d'import/export et suppression */}
                    <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <ImportExportButtons
                        onExport={exportPatients}
                        onImport={importPatients}
                        onReset={handleReset}
                      />
                      <Popconfirm
                        title="Supprimer tous les patients de la tournée"
                        description="Cette action va supprimer tous les patients de la tournée actuelle (sauf la pharmacie). Voulez-vous continuer ?"
                        onConfirm={() => {
                          clearCurrentTour();
                          message.success('Tous les patients ont été supprimés de la tournée');
                        }}
                        okText="Oui"
                        cancelText="Non"
                      >
                        <Button type="primary" danger icon={<DeleteOutlined />}>
                          Supprimer tous les patients
                        </Button>
                      </Popconfirm>
                    </div>

                    {/* Panneau d'optimisation */}
                    <OptimizationPanel
                      result={optimizationResult}
                      isOptimizing={isOptimizing}
                      onOptimize={optimizeRoute}
                      patientCount={patients.length}
                    />

                    <Divider />

                    {/* Carte interactive */}
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Title level={5} style={{ margin: 0 }}>
                          Carte des livraisons (itinéraire routier)
                        </Title>
                        <Tooltip title={enableClustering ? 'Désactiver le clustering' : 'Activer le clustering'}>
                          <Switch
                            checked={enableClustering}
                            onChange={setEnableClustering}
                            checkedChildren="Cluster"
                            unCheckedChildren="Marqueurs"
                            style={{ marginLeft: 8 }}
                          />
                        </Tooltip>
                      </div>
                      <MapView
                        patients={patients}
                        optimizationResult={optimizationResult}
                        routePolyline={routePolyline}
                        height="600px"
                        enableClustering={enableClustering}
                      />
                    </div>

                    <Divider />

                    {/* Tableau des patients */}
                    <div>
                      <Title level={5} style={{ marginBottom: 16 }}>
                        Liste des patients ({filteredPatients.length})
                      </Title>
                      <PatientTable
                        patients={filteredPatients}
                        onEdit={handleEditPatient}
                        onDelete={deletePatient}
                        onAdd={handleAddPatient}
                      />
                    </div>
                  </>
                ),
              },
              {
                key: '2',
                label: `Base de données (${databasePatients.length} patients)`,
                children: (
                  <DatabasePanel
                    databasePatients={databasePatients}
                    onAddToDatabase={addToDatabase}
                    onLoadFromDatabase={loadFromDatabase}
                    isGeocoding={isGeocoding}
                  />
                ),
              },
            ]}
          />
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', padding: '16px 24px' }}>
        <Text type="secondary">
          Application d'optimisation des tournées de livraison - La Réunion | 
          Pharmacie de l'Océan Indien: 133 Avenue du Mahatma Gandhi, 97441 Sainte-Suzanne
        </Text>
      </Footer>

      {/* Formulaire modal pour ajouter/modifier un patient */}
      <PatientForm
        visible={isFormVisible}
        onCancel={() => {
          setIsFormVisible(false);
          setEditingPatient(null);
        }}
        onSubmit={handleFormSubmit}
        initialPatient={editingPatient || undefined}
        isGeocoding={isGeocoding}
        existingPatients={patients}
      />

      {/* Bouton flottant pour ajouter un patient */}
      <FloatButton
        tooltip="Ajouter un patient"
        type="primary"
        onClick={handleAddPatient}
        style={{ right: 24, bottom: 24 }}
      />
    </Layout>
  );
};

export default App;

import React, { useState } from 'react';
import { Layout, Typography, theme, Divider, FloatButton } from 'antd';
import { usePatients } from './hooks/usePatients';
import PatientTable from './components/PatientTable';
import PatientForm from './components/PatientForm';
import MapView from './components/MapView';
import OptimizationPanel from './components/OptimizationPanel';
import ImportExportButtons from './components/ImportExportButtons';
import SearchBar from './components/SearchBar';
import { Patient } from './types';

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
    searchQuery,
    setSearchQuery,
    isGeocoding,
  } = usePatients();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

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
      // L'erreur est déjà gérée dans le hook
    }
  };

  const handleReset = () => {
    setSearchQuery('');
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
        <div
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            padding: 24,
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          {/* Titre et description */}
          <div style={{ marginBottom: 24 }}>
            <Title level={4} style={{ marginBottom: 8 }}>
              Gestion des tournées de livraison
            </Title>
            <Text type="secondary">
              Optimisez vos tournées de livraison pour les patients à La Réunion
            </Text>
          </div>

          {/* Barre de recherche */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
          />

          {/* Boutons d'import/export */}
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <ImportExportButtons onReset={handleReset} />
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
            <Title level={5} style={{ marginBottom: 16 }}>
              Carte des livraisons
            </Title>
            <MapView
              patients={patients}
              optimizationResult={optimizationResult}
              height="600px"
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
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', padding: '16px 24px' }}>
        <Text type="secondary">
          Application d'optimisation des tournées de livraison - La Réunion
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

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Spin } from 'antd';
import { Patient } from '../types';

interface PatientFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (patient: Omit<Patient, 'id' | 'isPharmacy' | 'latitude' | 'longitude'>) => Promise<void>;
  initialPatient?: Partial<Patient>;
  isGeocoding?: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialPatient,
  isGeocoding = false,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialPatient) {
      form.setFieldsValue(initialPatient);
    } else {
      form.resetFields();
    }
  }, [initialPatient, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);
      await onSubmit({
        nom: values.nom,
        adresse: values.adresse,
      });
      form.resetFields();
      message.success(initialPatient ? 'Patient modifié avec succès' : 'Patient ajouté avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      message.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialPatient ? 'Modifier le patient' : 'Ajouter un patient'}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Annuler
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={loading || isGeocoding}
          disabled={isGeocoding}
        >
          {isGeocoding ? 'Géocodage en cours...' : (initialPatient ? 'Modifier' : 'Ajouter')}
        </Button>,
      ]}
      destroyOnClose
    >
      {isGeocoding && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Spin tip="Recherche des coordonnées GPS..." />
        </div>
      )}
      
      <Form
        form={form}
        layout="vertical"
        name="patient_form"
      >
        <Form.Item
          name="nom"
          label="Nom"
          rules={[{ required: true, message: 'Veuillez entrer un nom' }]}
        >
          <Input placeholder="Nom du patient" />
        </Form.Item>

        <Form.Item
          name="adresse"
          label="Adresse"
          rules={[{ required: true, message: 'Veuillez entrer une adresse' }]}
          help="Les coordonnées GPS seront automatiquement déterminées à partir de l'adresse"
        >
          <Input.TextArea
            placeholder="Ex: 133 Avenue du Mahatma Gandhi, 97441 Sainte-Suzanne"
            rows={3}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PatientForm;

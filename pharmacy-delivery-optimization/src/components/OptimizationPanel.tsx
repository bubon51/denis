import React from 'react';
import { Card, Button, Spin, Statistic, Row, Col, Typography, Space, Alert } from 'antd';
import { OptimizationResult } from '../types';

const { Title, Text } = Typography;

interface OptimizationPanelProps {
  result: OptimizationResult | null;
  isOptimizing: boolean;
  onOptimize: () => void;
  patientCount: number;
}

const OptimizationPanel: React.FC<OptimizationPanelProps> = ({
  result,
  isOptimizing,
  onOptimize,
  patientCount,
}) => {
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  return (
    <Card
      title="Optimisation de la tournée"
      style={{ marginBottom: 24 }}
      headStyle={{ backgroundColor: '#f0f0f0' }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Nombre de patients"
              value={patientCount}
              prefix={<span>👥</span>}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Distance totale"
              value={result ? `${result.totalDistance} km` : 'N/A'}
              prefix={<span>📏</span>}
              valueStyle={{ color: result ? '#52c41a' : '#999' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Temps total estimé"
              value={result ? formatTime(result.totalTime) : 'N/A'}
              prefix={<span>⏱️</span>}
              valueStyle={{ color: result ? '#52c41a' : '#999' }}
            />
          </Col>
        </Row>

        {result && result.route.length > 1 && (
          <Card size="small" title="Ordre de livraison optimisé">
            <Space direction="vertical" size="small">
              {result.route.map((routePoint, index) => (
                <div
                  key={routePoint.patient.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: index === 0 ? '#e6f7ff' : '#fafafa',
                    borderRadius: '4px',
                    borderLeft: `4px solid ${index === 0 ? '#1890ff' : '#52c41a'}`,
                  }}
                >
                  <Text strong style={{ width: 30, color: index === 0 ? '#1890ff' : '#52c41a' }}>
                    #{index + 1}
                  </Text>
                  <Text style={{ flex: 1, marginLeft: 8 }}>
                    {routePoint.patient.nom}
                  </Text>
                </div>
              ))}
            </Space>
          </Card>
        )}

        {result && result.route.length > 1 && (
          <Alert
            message={`L'itinéraire optimisé commence par la pharmacie et visite ${result.route.length} points.`}
            type="info"
            showIcon
          />
        )}

        <Button
          type="primary"
          onClick={onOptimize}
          loading={isOptimizing}
          disabled={patientCount <= 1}
          size="large"
          block
        >
          {isOptimizing ? (
            <>
              <Spin size="small" /> Calcul en cours...
            </>
          ) : (
            'Calculer l\'itinéraire optimal'
          )}
        </Button>

        {patientCount <= 1 && (
          <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
            Ajoutez au moins 2 patients pour calculer un itinéraire.
          </Text>
        )}
      </Space>
    </Card>
  );
};

export default OptimizationPanel;

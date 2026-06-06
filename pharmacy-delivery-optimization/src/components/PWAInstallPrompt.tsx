import React, { useState, useEffect } from 'react';
import { Button, Modal, Space, Typography } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface PWAInstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
  visible: boolean;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onInstall, onDismiss, visible }) => {
  return (
    <Modal
      title="Installer l'application"
      open={visible}
      onCancel={onDismiss}
      footer={[
        <Button key="cancel" onClick={onDismiss}>
          Plus tard
        </Button>,
        <Button
          key="install"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={onInstall}
        >
          Installer
        </Button>,
      ]}
      destroyOnClose
      width={400}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text>
          Vous pouvez installer cette application sur votre appareil pour un accès plus rapide 
          et une expérience hors ligne.
        </Text>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          L'application fonctionnera comme une app native sur votre téléphone ou ordinateur.
        </Text>
      </Space>
    </Modal>
  );
};

// Composant principal pour gérer l'installation PWA et les mises à jour
const usePWA = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Détecter si l'application peut être installée
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    };
  }, []);

  // Détecter les mises à jour du service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const checkForUpdates = () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
          registration.onupdatefound = () => {
            setUpdateAvailable(true);
            setShowUpdatePrompt(true);
          };
        });
      };

      // Vérifier les mises à jour périodiquement
      const interval = setInterval(checkForUpdates, 60000); // Toutes les minutes
      return () => clearInterval(interval);
    }
  }, []);

  // Installer l'application
  const installApp = async () => {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      if (outcome === 'accepted') {
        console.log('Utilisateur a accepté l\'installation');
      } else {
        console.log('Utilisateur a refusé l\'installation');
      }
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  // Rafraîchir la page pour appliquer la mise à jour
  const refreshPage = () => {
    window.location.reload();
  };

  // Masquer les prompts
  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  const dismissUpdatePrompt = () => {
    setShowUpdatePrompt(false);
  };

  return {
    showInstallPrompt,
    showUpdatePrompt,
    installApp,
    refreshPage,
    dismissInstallPrompt,
    dismissUpdatePrompt,
  };
};

// Composant principal à exporter
const PWAInstaller: React.FC = () => {
  const {
    showInstallPrompt,
    showUpdatePrompt,
    installApp,
    refreshPage,
    dismissInstallPrompt,
    dismissUpdatePrompt,
  } = usePWA();

  return (
    <>
      {/* Prompt d'installation */}
      <PWAInstallPrompt
        visible={showInstallPrompt}
        onInstall={installApp}
        onDismiss={dismissInstallPrompt}
      />

      {/* Prompt de mise à jour */}
      <Modal
        title="Nouvelle version disponible"
        open={showUpdatePrompt}
        onCancel={dismissUpdatePrompt}
        footer={[
          <Button key="cancel" onClick={dismissUpdatePrompt}>
            Plus tard
          </Button>,
          <Button
            key="update"
            type="primary"
            icon={<ReloadOutlined />}
            onClick={refreshPage}
          >
            Rafraîchir
          </Button>,
        ]}
        destroyOnClose
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>
            Une nouvelle version de l'application est disponible.
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Rafraîchissez la page pour obtenir les dernières fonctionnalités.
          </Text>
        </Space>
      </Modal>
    </>
  );
};

export default PWAInstaller;

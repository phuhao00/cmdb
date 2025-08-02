'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  Shield, 
  Bell, 
  Users, 
  Globe, 
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { apiService } from '@/services/api';

interface SystemSettings {
  general: {
    systemName: string;
    systemVersion: string;
    adminEmail: string;
    timezone: string;
    language: string;
  };
  security: {
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    mfaEnabled: boolean;
    ipWhitelist: string[];
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    webhookEnabled: boolean;
    alertThreshold: number;
    notificationChannels: string[];
  };
  integration: {
    ldapEnabled: boolean;
    ldapServer: string;
    ldapBaseDN: string;
    apiEnabled: boolean;
    apiRateLimit: number;
    webhookUrl: string;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: string;
    backupRetention: number;
    backupLocation: string;
  };
}

const defaultSettings: SystemSettings = {
  general: {
    systemName: 'CMDB 管理系统',
    systemVersion: '1.0.0',
    adminEmail: 'admin@example.com',
    timezone: 'Asia/Shanghai',
    language: 'zh-CN'
  },
  security: {
    sessionTimeout: 30,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    mfaEnabled: false,
    ipWhitelist: []
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    webhookEnabled: false,
    alertThreshold: 80,
    notificationChannels: ['email']
  },
  integration: {
    ldapEnabled: false,
    ldapServer: '',
    ldapBaseDN: '',
    apiEnabled: true,
    apiRateLimit: 1000,
    webhookUrl: ''
  },
  backup: {
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    backupLocation: '/backup'
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // 这里应该调用实际的API来加载设置
      // const response = await apiService.getSystemSettings();
      // setSettings(response.data);
      console.log('Loading system settings...');
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage({ type: 'error', text: '加载设置失败' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // 这里应该调用实际的API来保存设置
      // await apiService.updateSystemSettings(settings);
      console.log('Saving settings:', settings);
      setMessage({ type: 'success', text: '设置保存成功' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: '保存设置失败' });
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateNestedSettings = (section: keyof SystemSettings, parentKey: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentKey]: {
          ...(prev[section] as any)[parentKey],
          [key]: value
        }
      }
    }));
  };

  const testConnection = async (type: string) => {
    try {
      // 这里应该调用实际的API来测试连接
      console.log(`Testing ${type} connection...`);
      setMessage({ type: 'success', text: `${type}连接测试成功` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: `${type}连接测试失败` });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">加载设置中...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Settings className="mr-2 h-8 w-8" />
            系统设置
          </h1>
          <p className="text-gray-600 mt-2">
            管理系统配置、安全设置、通知选项等
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadSettings}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertTriangle className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基本设置 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              基本设置
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="systemName" className="block text-sm font-medium text-gray-700">
                系统名称
              </label>
              <input
                id="systemName"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.general.systemName}
                onChange={(e) => updateSettings('general', 'systemName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
                管理员邮箱
              </label>
              <input
                id="adminEmail"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.general.adminEmail}
                onChange={(e) => updateSettings('general', 'adminEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                时区
              </label>
              <select
                id="timezone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.general.timezone}
                onChange={(e) => updateSettings('general', 'timezone', e.target.value)}
              >
                <option value="Asia/Shanghai">Asia/Shanghai</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                语言
              </label>
              <select
                id="language"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.general.language}
                onChange={(e) => updateSettings('general', 'language', e.target.value)}
              >
                <option value="zh-CN">中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* 安全设置 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              安全设置
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">
                会话超时时间（分钟）
              </label>
              <input
                id="sessionTimeout"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">密码策略</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requireUppercase"
                    checked={settings.security.passwordPolicy.requireUppercase}
                    onChange={(e) => updateNestedSettings('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireUppercase" className="text-sm text-gray-700">要求大写字母</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requireLowercase"
                    checked={settings.security.passwordPolicy.requireLowercase}
                    onChange={(e) => updateNestedSettings('security', 'passwordPolicy', 'requireLowercase', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireLowercase" className="text-sm text-gray-700">要求小写字母</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requireNumbers"
                    checked={settings.security.passwordPolicy.requireNumbers}
                    onChange={(e) => updateNestedSettings('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireNumbers" className="text-sm text-gray-700">要求数字</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requireSpecialChars"
                    checked={settings.security.passwordPolicy.requireSpecialChars}
                    onChange={(e) => updateNestedSettings('security', 'passwordPolicy', 'requireSpecialChars', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireSpecialChars" className="text-sm text-gray-700">要求特殊字符</label>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="mfaEnabled"
                checked={settings.security.mfaEnabled}
                onChange={(e) => updateSettings('security', 'mfaEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="mfaEnabled" className="text-sm text-gray-700">启用双因素认证</label>
            </div>
          </div>
        </div>

        {/* 通知设置 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              通知设置
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emailEnabled"
                checked={settings.notifications.emailEnabled}
                onChange={(e) => updateSettings('notifications', 'emailEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="emailEnabled" className="text-sm text-gray-700">启用邮件通知</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="smsEnabled"
                checked={settings.notifications.smsEnabled}
                onChange={(e) => updateSettings('notifications', 'smsEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="smsEnabled" className="text-sm text-gray-700">启用短信通知</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="webhookEnabled"
                checked={settings.notifications.webhookEnabled}
                onChange={(e) => updateSettings('notifications', 'webhookEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="webhookEnabled" className="text-sm text-gray-700">启用Webhook通知</label>
            </div>
            <div className="space-y-2">
              <label htmlFor="alertThreshold" className="block text-sm font-medium text-gray-700">
                告警阈值（%）
              </label>
              <input
                id="alertThreshold"
                type="number"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.notifications.alertThreshold}
                onChange={(e) => updateSettings('notifications', 'alertThreshold', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* 集成设置 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center">
              <Database className="h-5 w-5 mr-2" />
              集成设置
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ldapEnabled"
                checked={settings.integration.ldapEnabled}
                onChange={(e) => updateSettings('integration', 'ldapEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="ldapEnabled" className="text-sm text-gray-700">启用LDAP认证</label>
            </div>
            {settings.integration.ldapEnabled && (
              <>
                <div className="space-y-2">
                  <label htmlFor="ldapServer" className="block text-sm font-medium text-gray-700">
                    LDAP服务器
                  </label>
                  <input
                    id="ldapServer"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.integration.ldapServer}
                    onChange={(e) => updateSettings('integration', 'ldapServer', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="ldapBaseDN" className="block text-sm font-medium text-gray-700">
                    LDAP基础DN
                  </label>
                  <input
                    id="ldapBaseDN"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.integration.ldapBaseDN}
                    onChange={(e) => updateSettings('integration', 'ldapBaseDN', e.target.value)}
                  />
                </div>
                <button
                  onClick={() => testConnection('LDAP')}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  测试连接
                </button>
              </>
            )}
            <hr className="my-4" />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="apiEnabled"
                checked={settings.integration.apiEnabled}
                onChange={(e) => updateSettings('integration', 'apiEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="apiEnabled" className="text-sm text-gray-700">启用API访问</label>
            </div>
            {settings.integration.apiEnabled && (
              <div className="space-y-2">
                <label htmlFor="apiRateLimit" className="block text-sm font-medium text-gray-700">
                  API速率限制（请求/分钟）
                </label>
                <input
                  id="apiRateLimit"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.integration.apiRateLimit}
                  onChange={(e) => updateSettings('integration', 'apiRateLimit', parseInt(e.target.value))}
                />
              </div>
            )}
          </div>
        </div>

        {/* 备份设置 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center">
              <Database className="h-5 w-5 mr-2" />
              备份设置
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoBackup"
                checked={settings.backup.autoBackup}
                onChange={(e) => updateSettings('backup', 'autoBackup', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoBackup" className="text-sm text-gray-700">启用自动备份</label>
            </div>
            {settings.backup.autoBackup && (
              <>
                <div className="space-y-2">
                  <label htmlFor="backupFrequency" className="block text-sm font-medium text-gray-700">
                    备份频率
                  </label>
                  <select
                    id="backupFrequency"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.backup.backupFrequency}
                    onChange={(e) => updateSettings('backup', 'backupFrequency', e.target.value)}
                  >
                    <option value="hourly">每小时</option>
                    <option value="daily">每天</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="backupRetention" className="block text-sm font-medium text-gray-700">
                    保留天数
                  </label>
                  <input
                    id="backupRetention"
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.backup.backupRetention}
                    onChange={(e) => updateSettings('backup', 'backupRetention', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="backupLocation" className="block text-sm font-medium text-gray-700">
                    备份位置
                  </label>
                  <input
                    id="backupLocation"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.backup.backupLocation}
                    onChange={(e) => updateSettings('backup', 'backupLocation', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 系统信息 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              系统信息
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">系统版本</label>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                  {settings.general.systemVersion}
                </span>
                <span className="px-2 py-1 border border-gray-300 text-gray-600 rounded text-sm">
                  稳定版
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">数据库状态</label>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">连接正常</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">API状态</label>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">运行正常</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">最后备份</label>
              <span className="text-sm text-gray-500">2024-01-15 02:00:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
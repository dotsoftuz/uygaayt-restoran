import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import APIKeys from './APIKeys';
import TeamManagement from './TeamManagement';

function SystemSettings() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'team';

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        setSearchParams({ tab: value }, { replace: true });
      }}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="team" className="text-xs sm:text-sm">
          {t('team')}
        </TabsTrigger>
        <TabsTrigger value="api-keys" className="text-xs sm:text-sm">
          {t('apiKeys')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="team">
        <TeamManagement />
      </TabsContent>
      <TabsContent value="api-keys">
        <APIKeys />
      </TabsContent>
    </Tabs>
  );
}

export default SystemSettings;

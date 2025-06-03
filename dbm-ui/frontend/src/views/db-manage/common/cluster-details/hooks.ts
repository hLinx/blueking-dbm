import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { execCopy, getSelfDomain, messageWarn } from '@utils';

export const useCopyMachineIp = () => {
  const { t } = useI18n();
  const copyAllIp = (machineList: { ip: string }[]) => {
    const ipList = machineList.map((item) => item.ip);
    if (ipList.length < 1) {
      messageWarn(t('没有可复制IP'));
      return;
    }
    execCopy(
      ipList.join('\n'),
      t('复制成功，共n条', {
        n: ipList.length,
      }),
    );
  };

  const copyNotAliveIp = (machineList: { host_info: { alive: number; ip: string } }[]) => {
    const ipList = machineList.reduce((result, item) => {
      if (!item.host_info.alive) {
        result.push(item.host_info.ip);
      }
      return result;
    }, [] as Array<string>);

    if (ipList.length < 1) {
      messageWarn(t('没有可复制IP'));
      return;
    }

    execCopy(
      ipList.join('\n'),
      t('复制成功，共n条', {
        n: ipList.length,
      }),
    );
  };

  return {
    copyAllIp,
    copyNotAliveIp,
  };
};

export const useClusterDetail = (
  clusterDetailRouterName: string,
  payload: {
    clusterId: number;
    domain: () => string;
  },
) => {
  const router = useRouter();
  const route = useRoute();

  const detailRouterPage = clusterDetailRouterName === (route.name as string);

  const handleCopyClusterMasterDomainAndLink = () => {
    const { href } = router.resolve({
      name: clusterDetailRouterName,
      params: {
        clusterId: payload.clusterId,
      },
    });

    execCopy(`${payload.domain()}\n${getSelfDomain()}${href}`);
  };

  const handleCopyDetailPageLink = () => {
    const { href } = router.resolve({
      name: clusterDetailRouterName,
      params: {
        clusterId: payload.clusterId,
      },
    });
    execCopy(`${getSelfDomain()}${href}`);
  };

  return {
    detailRouterPage,
    handleCopyClusterMasterDomainAndLink,
    handleCopyDetailPageLink,
  };
};

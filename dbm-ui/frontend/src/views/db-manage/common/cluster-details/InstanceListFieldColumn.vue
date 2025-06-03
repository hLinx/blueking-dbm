<template>
  <BkTableColumn
    field="status"
    :min-width="80"
    :title="t('状态')">
    <template #default="{ data }: { data: IColumnData }">
      <ClusterInstanceStatus :data="data.status" />
    </template>
  </BkTableColumn>
  <BkTableColumn
    field="role"
    :min-width="100"
    :title="t('部署角色')">
    <template #default="{ data }: { data: IColumnData }">
      <RenderClusterRole :data="[data.role]" />
    </template>
  </BkTableColumn>
  <BkTableColumn
    field="version"
    :min-width="180"
    :title="t('版本')">
    <template #default="{ data }: { data: IColumnData }">
      {{ data.version || '--' }}
    </template>
  </BkTableColumn>
  <BkTableColumn
    field="ip"
    :min-width="150"
    :title="t('主机IP')">
    <template #default="{ data }: { data: IColumnData }">
      {{ data.ip || '--' }}
    </template>
  </BkTableColumn>
  <BkTableColumn
    field="bk_sub_zone"
    :min-width="120"
    :title="t('园区')">
    <template #default="{ data }: { data: IColumnData }">
      {{ data.bk_sub_zone || '--' }}
    </template>
  </BkTableColumn>
  <BkTableColumn
    field="bk_os_name"
    :min-width="250"
    :title="t('机型')">
    <template #default="{ data }: { data: IColumnData }">
      {{ data.bk_os_name || '--' }}
    </template>
  </BkTableColumn>
  <BkTableColumn
    field="create_at"
    :min-width="250"
    :title="t('部署时间')" />
</template>
<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  import ClusterInstanceStatus from '@components/cluster-instance-status/Index.vue';

  import RenderClusterRole from '@views/db-manage/common/RenderRole.vue';
  import useClusterInstanceList from '@views/db-manage/hooks/useClusterInstaceList';

  type IColumnData = ServiceReturnType<ReturnType<typeof useClusterInstanceList>>['results'][number];

  const { t } = useI18n();
</script>
